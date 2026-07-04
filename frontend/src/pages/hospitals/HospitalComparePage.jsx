import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { api, humanError } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { ScoreRing } from '@/components/common/ScoreRing';
import { TierBadge } from '@/components/common/TierBadge';
import { EmptyState } from '@/components/common/State';

export default function HospitalComparePage() {
  const [params] = useSearchParams();
  const ids = (params.get('ids') || '').split(',').filter(Boolean);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .get('/hospitals/compare', { params: { ids: ids.join(',') } })
      .then(({ data }) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => !cancelled && toast.error(humanError(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (ids.length < 2) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-12">
        <EmptyState
          title="Pick at least 2 hospitals to compare"
          description="Go to the directory, tap Compare on hospital cards, then return here."
          action={
            <Button asChild>
              <Link to="/hospitals">Open directory</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const allProcedures = Array.from(
    new Set(items.flatMap((h) => (h.pricing || []).map((p) => p.procedure)))
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <header>
        <div className="text-sm text-muted-foreground">Compare</div>
        <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">
          Side-by-side comparison
        </h1>
      </header>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="overflow-x-auto">
          <div
            className="grid gap-4 min-w-[720px]"
            style={{ gridTemplateColumns: `220px repeat(${items.length}, minmax(240px, 1fr))` }}
          >
            {/* Row: header */}
            <div />
            {items.map((h) => (
              <Card key={h.id} className="border-border">
                <CardContent className="pt-5 pb-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <ScoreRing value={h.value_score?.overall ?? 0} size={64} stroke={6} />
                    <div className="min-w-0">
                      <TierBadge tier={h.tier} />
                      <Link
                        to={`/hospitals/${h.id}`}
                        className="mt-1 block font-semibold text-sm leading-tight hover:text-primary"
                      >
                        {h.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{h.city}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Row: Value score breakdown */}
            <SectionLabel label="Value Score" />
            {items.map((h) => (
              <div key={h.id + '-score'} className="rounded-xl border border-border bg-card p-4 space-y-2">
                {['price', 'quality', 'availability', 'trust'].map((k) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs">
                      <span className="capitalize text-muted-foreground">{k}</span>
                      <span className="tabular font-medium">
                        {h.value_score?.[k] ?? '—'}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${h.value_score?.[k] ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Row: Beds */}
            <SectionLabel label="Beds (free / total)" />
            {items.map((h) => (
              <div key={h.id + '-beds'} className="rounded-xl border border-border bg-card p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">General</span>
                  <span className="tabular font-medium">
                    {h.beds?.free_general_beds} / {(h.beds?.total_beds ?? 0) - (h.beds?.icu_beds ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ICU</span>
                  <span className="tabular font-medium">
                    {h.beds?.free_icu_beds} / {h.beds?.icu_beds}
                  </span>
                </div>
              </div>
            ))}

            {/* Row: Rating */}
            <SectionLabel label="Rating" />
            {items.map((h) => (
              <div key={h.id + '-rate'} className="rounded-xl border border-border bg-card p-4 text-sm">
                <span className="tabular font-semibold text-lg">
                  {h.rating?.toFixed(1)}
                </span>{' '}
                <span className="text-muted-foreground text-xs">
                  ({h.review_count} reviews)
                </span>
              </div>
            ))}

            {/* Procedure rows */}
            {allProcedures.map((proc) => (
              <ProcedureRow key={proc} proc={proc} items={items} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <div className="flex items-center min-h-[40px] text-xs uppercase tracking-wide text-muted-foreground font-medium">
      {label}
    </div>
  );
}

function ProcedureRow({ proc, items }) {
  return (
    <>
      <SectionLabel label={proc} />
      {items.map((h) => {
        const p = h.pricing?.find((x) => x.procedure === proc);
        return (
          <div
            key={h.id + proc}
            className="rounded-xl border border-border bg-card p-4 text-sm space-y-1"
          >
            {p ? (
              <>
                <div className="tabular text-lg font-semibold">
                  {formatINR(p.typical_inr)}
                </div>
                <div className="tabular text-xs text-muted-foreground">
                  {formatINR(p.low_inr)} – {formatINR(p.high_inr)}
                </div>
              </>
            ) : (
              <span className="text-muted-foreground text-xs">Not listed</span>
            )}
          </div>
        );
      })}
    </>
  );
}

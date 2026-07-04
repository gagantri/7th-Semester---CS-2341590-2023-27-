import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  BedDouble,
  Users,
  Building2,
  Award,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { api, humanError } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { ScoreRing } from '@/components/common/ScoreRing';
import { TierBadge } from '@/components/common/TierBadge';
import { TEST_IDS } from '@/constants/testIds';

export default function HospitalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [h, setH] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/hospitals/${id}`)
      .then(({ data }) => {
        if (!cancelled) setH(data);
      })
      .catch((err) => {
        if (!cancelled) toast.error(humanError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }
  if (!h) return null;

  const vs = h.value_score || {};

  return (
    <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        data-testid={TEST_IDS.hospitals.detailBack}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Hero */}
      <section className="card-elevated overflow-hidden">
        <div className="relative hero-mesh px-6 py-8 md:px-10 md:py-10 noise-overlay">
          <div className="relative z-10 flex flex-wrap items-center gap-6">
            <ScoreRing value={vs.overall ?? 0} size={110} stroke={10} label="Value Score" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <TierBadge tier={h.tier} />
                {h.emergency_247 && (
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] border-emerald-300 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300"
                  >
                    24×7 Emergency
                  </Badge>
                )}
                {h.accreditation?.slice(0, 3).map((a) => (
                  <Badge
                    key={a}
                    variant="outline"
                    className="h-5 text-[10px]"
                  >
                    {a}
                  </Badge>
                ))}
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
                {h.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {h.address}
                </span>
                <a
                  href={`tel:${h.phone}`}
                  className="inline-flex items-center gap-1 hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {h.phone}
                </a>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <a href={`tel:${h.phone}`}>Call hospital</a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`}
                  >
                    Directions
                  </a>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/hospitals/compare?ids=${h.id}`}>Add to compare</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="grid gap-2 md:grid-cols-4 border-t border-border">
          {[
            { label: 'Price', v: vs.price, hint: 'Lower = more affordable' },
            { label: 'Quality', v: vs.quality, hint: 'Care outcomes + reviews' },
            { label: 'Availability', v: vs.availability, hint: 'Live beds + wait time' },
            { label: 'Trust', v: vs.trust, hint: 'Accreditation + tenure' },
          ].map((m) => (
            <div key={m.label} className="p-5 md:border-r md:last:border-r-0 border-border">
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="tabular text-2xl font-semibold">{m.v ?? '—'}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${m.v ?? 0}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{m.hint}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About + beds + specialties */}
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {h.description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Established
                </div>
                <div className="tabular font-medium">{h.established_year ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Rating
                </div>
                <div className="tabular font-medium">
                  {h.rating?.toFixed(1) ?? '—'}{' '}
                  <span className="text-muted-foreground text-xs">
                    ({h.review_count} reviews)
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Tier
                </div>
                <div className="font-medium capitalize">{h.tier}</div>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Specialties
              </div>
              <div className="flex flex-wrap gap-1.5">
                {h.specialties?.map((s) => (
                  <Badge key={s} variant="secondary" className="font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Accreditation
              </div>
              <div className="flex flex-wrap gap-1.5">
                {h.accreditation?.map((a) => (
                  <Badge key={a} variant="outline" className="font-normal gap-1">
                    <Award className="h-3 w-3" /> {a}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Live availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-3">
                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <BedDouble className="h-3.5 w-3.5" /> Total beds
                </div>
                <div className="tabular text-2xl font-semibold mt-1">
                  {h.beds?.total_beds}
                </div>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> ICU beds
                </div>
                <div className="tabular text-2xl font-semibold mt-1">
                  {h.beds?.icu_beds}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 p-3">
                <div className="text-xs text-emerald-700 dark:text-emerald-200">
                  Free general
                </div>
                <div className="tabular text-2xl font-semibold mt-1 text-emerald-800 dark:text-emerald-100">
                  {h.beds?.free_general_beds}
                </div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  Free ICU
                </div>
                <div className="tabular text-2xl font-semibold mt-1 text-amber-900 dark:text-amber-100">
                  {h.beds?.free_icu_beds}
                </div>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Availability last updated {h.beds?.last_updated}. Live data will
              be phased in through ABDM HFR + hospital SaaS integration.
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pricing */}
      <section>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Published pricing (indicative)</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Ranges reflect typical Indian market rates for this hospital
                tier. Always request a written package rate before admission.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/cost-estimator">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                AI estimate
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedure</TableHead>
                    <TableHead className="text-right">Low</TableHead>
                    <TableHead className="text-right">Typical</TableHead>
                    <TableHead className="text-right">High</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {h.pricing?.map((p) => (
                    <TableRow key={p.procedure}>
                      <TableCell className="font-medium">{p.procedure}</TableCell>
                      <TableCell className="text-right tabular text-muted-foreground">
                        {formatINR(p.low_inr)}
                      </TableCell>
                      <TableCell className="text-right tabular font-semibold">
                        {formatINR(p.typical_inr)}
                      </TableCell>
                      <TableCell className="text-right tabular text-muted-foreground">
                        {formatINR(p.high_inr)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

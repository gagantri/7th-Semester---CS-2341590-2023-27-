import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Users, BedDouble, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { api, humanError } from '@/lib/api';
import { formatINRCompact } from '@/lib/format';
import { EmptyState } from '@/components/common/State';
import { TierBadge } from '@/components/common/TierBadge';
import { ScoreRing } from '@/components/common/ScoreRing';
import { TEST_IDS } from '@/constants/testIds';

export default function HospitalsListPage() {
  const [facets, setFacets] = useState({ cities: [], specialties: [], tiers: [] });
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('all');
  const [tier, setTier] = useState('all');
  const [specialty, setSpecialty] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState([]);

  useEffect(() => {
    api
      .get('/hospitals/facets')
      .then(({ data }) => setFacets(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = {};
    if (query) params.query = query;
    if (city !== 'all') params.city = city;
    if (tier !== 'all') params.tier = tier;
    if (specialty !== 'all') params.specialty = specialty;
    api
      .get('/hospitals', { params })
      .then(({ data }) => {
        if (!cancelled) setItems(data);
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
  }, [query, city, tier, specialty]);

  const toggleCompare = (id) => {
    setCompareIds((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 3) {
        toast.info('Compare up to 3 hospitals at a time.');
        return cur;
      }
      return [...cur, id];
    });
  };

  const clearAll = () => {
    setQuery('');
    setCity('all');
    setTier('all');
    setSpecialty('all');
  };

  const compareHref = useMemo(() => {
    if (compareIds.length < 2) return null;
    return `/hospitals/compare?ids=${compareIds.join(',')}`;
  }, [compareIds]);

  return (
    <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8 py-8 space-y-6">
      <header>
        <div className="text-sm text-muted-foreground">Directory</div>
        <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">
          Hospitals in India
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl text-sm">
          Search verified hospitals across cities. Compare price ranges, Value
          Scores, and live bed availability.
        </p>
      </header>

      <div className="card-elevated p-4 md:p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hospital, city, specialty…"
              className="pl-10 h-11"
              data-testid={TEST_IDS.hospitals.searchInput}
            />
          </div>
          <div className="grid grid-cols-3 md:flex gap-2">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger
                className="h-11 min-w-[130px]"
                data-testid={TEST_IDS.hospitals.cityFilter}
              >
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {facets.cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger
                className="h-11 min-w-[130px]"
                data-testid={TEST_IDS.hospitals.tierFilter}
              >
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tiers</SelectItem>
                {facets.tiers.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger
                className="h-11 min-w-[150px]"
                data-testid={TEST_IDS.hospitals.specialtyFilter}
              >
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All specialties</SelectItem>
                {facets.specialties.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" onClick={clearAll} className="h-11 gap-1">
            <X className="h-4 w-4" /> Clear
          </Button>
        </div>

        {compareIds.length > 0 && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">{compareIds.length}</span>{' '}
              selected for comparison
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCompareIds([])}
                className="ml-2 h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
            <Button
              disabled={compareIds.length < 2}
              size="sm"
              asChild={!!compareHref}
              data-testid={TEST_IDS.hospitals.compareButton}
            >
              {compareHref ? (
                <Link to={compareHref}>Compare {compareIds.length}</Link>
              ) : (
                <span>Compare (add another)</span>
              )}
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No hospitals match your filters"
          description="Try removing city or tier filters, or search a different specialty."
          action={
            <Button onClick={clearAll} variant="outline" size="sm">
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((h) => {
            const opd = h.pricing?.find(
              (p) => p.procedure?.toLowerCase().includes('opd')
            );
            const selected = compareIds.includes(h.id);
            return (
              <Card
                key={h.id}
                data-testid={TEST_IDS.hospitals.resultCard}
                className={`border-border relative overflow-hidden transition-all hover:shadow-lg ${
                  selected ? 'ring-2 ring-primary/40' : 'hover:border-primary/30'
                }`}
              >
                <CardContent className="pt-5 pb-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <ScoreRing value={h.value_score?.overall ?? 0} size={72} stroke={7} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <TierBadge tier={h.tier} />
                        {h.emergency_247 && (
                          <Badge
                            variant="outline"
                            className="h-5 text-[10px] border-emerald-300 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300"
                          >
                            24×7 ER
                          </Badge>
                        )}
                      </div>
                      <Link
                        to={`/hospitals/${h.id}`}
                        className="mt-1 block font-semibold text-base leading-tight truncate hover:text-primary"
                      >
                        {h.name}
                      </Link>
                      <div className="mt-0.5 text-xs text-muted-foreground inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {h.city}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="rounded-lg bg-surface-2 py-2">
                      <BedDouble className="h-3.5 w-3.5 inline text-muted-foreground" />
                      <div className="tabular font-semibold mt-0.5">
                        {h.beds?.free_general_beds ?? '—'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        gen beds
                      </div>
                    </div>
                    <div className="rounded-lg bg-surface-2 py-2">
                      <Users className="h-3.5 w-3.5 inline text-muted-foreground" />
                      <div className="tabular font-semibold mt-0.5">
                        {h.beds?.free_icu_beds ?? '—'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">ICU</div>
                    </div>
                    <div className="rounded-lg bg-surface-2 py-2">
                      <div className="tabular font-semibold mt-1">
                        {h.rating?.toFixed(1) ?? '—'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">rating</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="text-muted-foreground">
                      OPD from{' '}
                      <span className="tabular font-semibold text-foreground">
                        {opd ? formatINRCompact(opd.low_inr) : '—'}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/hospitals/${h.id}`}>View</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant={selected ? 'default' : 'secondary'}
                        onClick={() => toggleCompare(h.id)}
                      >
                        {selected ? 'Selected' : 'Compare'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

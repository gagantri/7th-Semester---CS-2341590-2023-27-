import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Siren,
  MapPin,
  Phone,
  Navigation,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, humanError } from '@/lib/api';
import { InlineAlert } from '@/components/common/State';
import { TierBadge } from '@/components/common/TierBadge';
import { TEST_IDS } from '@/constants/testIds';

const HELPLINES = [
  { number: '112', label: 'National emergency', tone: 'red' },
  { number: '108', label: 'Ambulance', tone: 'red' },
  { number: '102', label: 'Medical helpline', tone: 'amber' },
  { number: '1091', label: 'Women helpline', tone: 'amber' },
  { number: '1098', label: 'Child helpline', tone: 'amber' },
  { number: '1910', label: 'Blood bank', tone: 'sky' },
  { number: '1066', label: 'Poison control', tone: 'sky' },
];

const DEFAULT_LOC = { lat: 28.5672, lng: 77.21 }; // AIIMS Delhi area

export default function EmergencyPage() {
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [helplines, setHelplines] = useState({});
  const [status, setStatus] = useState('idle'); // idle | locating | ready | denied | fallback
  const [coords, setCoords] = useState(null);

  const fetchNearest = async (lat, lng) => {
    setLoading(true);
    try {
      const { data } = await api.get('/emergency/nearest', {
        params: { lat, lng, limit: 10 },
      });
      setHospitals(data.hospitals);
      setHelplines(data.helplines);
    } catch (err) {
      toast.error(humanError(err));
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus('fallback');
      setCoords(DEFAULT_LOC);
      fetchNearest(DEFAULT_LOC.lat, DEFAULT_LOC.lng);
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setStatus('ready');
        fetchNearest(c.lat, c.lng);
      },
      () => {
        setStatus('denied');
        setCoords(DEFAULT_LOC);
        fetchNearest(DEFAULT_LOC.lat, DEFAULT_LOC.lng);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    // On first mount, we do NOT auto-request location — wait for user tap.
  }, []);

  return (
    <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8 py-8 space-y-6">
      <header className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center pulse-ring">
          <Siren className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Emergency Finder</div>
          <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">
            Get help. Fast.
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl text-sm">
            One-tap emergency dial, then the nearest 24×7 hospitals with
            directions.
          </p>
        </div>
      </header>

      {/* Emergency call bar */}
      <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-red-800 dark:text-red-200">
                Is this a life-threatening emergency?
              </div>
              <div className="text-xs text-red-800/80 dark:text-red-200/80">
                Call 112 (all-in-one) or 108 (ambulance) now.
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              className="bg-red-600 hover:bg-red-700 text-white h-11 px-5"
              data-testid={TEST_IDS.emergency.call112}
            >
              <a href="tel:112">
                <Phone className="mr-1.5 h-4 w-4" /> Call 112
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-5 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/50"
              data-testid={TEST_IDS.emergency.callAmbulance}
            >
              <a href="tel:108">
                <Phone className="mr-1.5 h-4 w-4" /> Call 108
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Location prompt */}
      {status === 'idle' && (
        <Card className="border-border">
          <CardContent className="pt-6 pb-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Navigation className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Share your location</div>
                <div className="text-sm text-muted-foreground">
                  We’ll show you the nearest 24×7 hospitals. Nothing is
                  stored.
                </div>
              </div>
            </div>
            <Button
              onClick={requestLocation}
              className="h-11 px-5"
              data-testid={TEST_IDS.emergency.requestLocation}
            >
              Use my location
            </Button>
          </CardContent>
        </Card>
      )}

      {(status === 'locating' || (loading && status !== 'idle')) && (
        <Card className="border-border">
          <CardContent className="pt-6 pb-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="text-sm">Finding nearest hospitals…</div>
          </CardContent>
        </Card>
      )}

      {status === 'denied' && (
        <InlineAlert tone="warning" title="Location permission denied">
          Showing hospitals near central Delhi as a fallback. To see hospitals
          near you, allow location access in your browser settings and
          reload.
        </InlineAlert>
      )}

      {/* Hospitals list */}
      {hospitals.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {hospitals.map((h) => (
            <Card key={h.id} className="border-border">
              <CardContent className="pt-5 pb-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <TierBadge tier={h.tier} />
                      <Badge
                        variant="outline"
                        className="h-5 text-[10px] border-emerald-300 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300"
                      >
                        24×7 ER
                      </Badge>
                      <span className="tabular text-xs text-muted-foreground">
                        • {h.distance_km} km
                      </span>
                    </div>
                    <Link
                      to={`/hospitals/${h.id}`}
                      className="mt-1 block font-semibold text-base leading-tight hover:text-primary"
                    >
                      {h.name}
                    </Link>
                    <div className="mt-0.5 text-xs text-muted-foreground inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {h.city}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-surface-2 p-2">
                    <div className="text-[10px] text-muted-foreground">
                      Free ICU
                    </div>
                    <div className="tabular font-semibold">
                      {h.beds?.free_icu_beds}
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface-2 p-2">
                    <div className="text-[10px] text-muted-foreground">
                      Free General
                    </div>
                    <div className="tabular font-semibold">
                      {h.beds?.free_general_beds}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    className="bg-red-600 hover:bg-red-700 text-white h-9"
                  >
                    <a href={`tel:${h.phone}`}>
                      <Phone className="mr-1.5 h-3.5 w-3.5" /> Call hospital
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`}
                    >
                      <Navigation className="mr-1.5 h-3.5 w-3.5" /> Directions
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Public helplines */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Public helplines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {HELPLINES.map((h) => (
              <a
                key={h.number}
                href={`tel:${h.number}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-colors"
              >
                <div>
                  <div className="text-xs text-muted-foreground">{h.label}</div>
                  <div className="font-medium">{h.label}</div>
                </div>
                <div className="tabular font-semibold text-primary text-lg">
                  {h.number}
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

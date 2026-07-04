import { useState } from 'react';
import { Calculator, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { api, humanError } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { InlineAlert } from '@/components/common/State';
import { TEST_IDS } from '@/constants/testIds';

const CITIES = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Kochi',
];

export default function CostEstimatorPage() {
  const [condition, setCondition] = useState('');
  const [city, setCity] = useState('Delhi');
  const [tier, setTier] = useState('private');
  const [insurance, setInsurance] = useState('no insurance / cash payment');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e?.preventDefault();
    if (!condition.trim()) {
      toast.error('Enter a condition or procedure name.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/ai/cost-estimate', {
        condition: condition.trim(),
        city,
        hospital_tier: tier,
        insurance,
        notes: notes || null,
      });
      setResult(data);
    } catch (err) {
      toast.error(humanError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8 py-8 space-y-6">
      <header className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">AI Cost Estimator</div>
          <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">
            Estimate treatment cost
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl text-sm">
            Realistic city-adjusted ranges with an itemised breakdown, cost
            drivers, and questions to ask before you admit.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Your details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label htmlFor="condition">Condition or procedure</Label>
                <Input
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g., Coronary Angioplasty, Kidney Stone Surgery, C-Section"
                  data-testid={TEST_IDS.cost.conditionInput}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger data-testid={TEST_IDS.cost.cityInput}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Hospital tier</Label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger data-testid={TEST_IDS.cost.tierSelect}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="trust">Trust</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="insurance">Insurance context</Label>
                <Input
                  id="insurance"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  placeholder="e.g., 5L HDFC ERGO, PMJAY, CGHS, or 'no insurance'"
                  data-testid={TEST_IDS.cost.insuranceInput}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Age, comorbidities, elective vs emergency, etc."
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading}
                data-testid={TEST_IDS.cost.submit}
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                {loading ? 'Estimating… ~20s' : 'Get AI estimate'}
                {!loading && <ArrowRight className="ml-1.5 h-4 w-4" />}
              </Button>
              <InlineAlert tone="info">
                Estimates are indicative and NOT a quote. Always request a
                written package rate from your hospital.
              </InlineAlert>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <Card className="border-border">
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : result ? (
            <ResultCard result={result} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-8 pb-8 text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="font-semibold">Your estimate will appear here</div>
                <div className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Low → typical → high range, itemised breakdown, and cost
                  drivers based on Indian market data.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <BreakdownTable result={result} />
        </motion.div>
      )}

      {result && <Extras result={result} />}
    </div>
  );
}

function ResultCard({ result }) {
  const e = result.estimate_inr;
  const oop = result.out_of_pocket_inr;
  return (
    <Card
      className="border-border overflow-hidden"
      data-testid={TEST_IDS.cost.resultRange}
    >
      <div className="hero-mesh px-5 py-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {result.condition}
            </div>
            <div className="text-xs text-muted-foreground">
              {result.city} · {result.hospital_tier}
            </div>
          </div>
          <Badge
            variant="outline"
            className={`capitalize ${
              result.confidence === 'high'
                ? 'border-emerald-300 text-emerald-700'
                : result.confidence === 'medium'
                ? 'border-amber-300 text-amber-700'
                : 'border-red-300 text-red-700'
            }`}
          >
            Confidence: {result.confidence}
          </Badge>
        </div>
        <div className="mt-4 flex items-baseline flex-wrap gap-3">
          <div>
            <div className="tabular text-[11px] uppercase tracking-wide text-muted-foreground">
              Typical
            </div>
            <div className="tabular text-3xl md:text-4xl font-semibold">
              {formatINR(e.typical)}
            </div>
          </div>
          <div className="text-sm text-muted-foreground tabular">
            range: {formatINR(e.low)} – {formatINR(e.high)}
          </div>
        </div>
        {oop && (
          <div className="mt-3 text-xs text-muted-foreground">
            Estimated out-of-pocket:{' '}
            <span className="tabular font-medium text-foreground">
              {formatINR(oop.low)} – {formatINR(oop.high)}
            </span>{' '}
            (typical {formatINR(oop.typical)})
          </div>
        )}
      </div>
      <CardContent className="pt-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Low</div>
            <div className="tabular font-semibold">{formatINR(e.low)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Typical</div>
            <div className="tabular font-semibold text-primary">
              {formatINR(e.typical)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">High</div>
            <div className="tabular font-semibold">{formatINR(e.high)}</div>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-primary to-amber-500"
            style={{ width: '100%' }}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Expected stay: {result.expected_stay_days} day(s)
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownTable({ result }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Cost breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Low</TableHead>
                <TableHead className="text-right">Typical</TableHead>
                <TableHead className="text-right">High</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.breakdown?.map((b, i) => (
                <TableRow key={`${b.category}-${i}`}>
                  <TableCell>
                    <div className="font-medium">{b.category}</div>
                    <div className="text-xs text-muted-foreground max-w-xl mt-0.5">
                      {b.notes}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular text-muted-foreground">
                    {formatINR(b.low_inr)}
                  </TableCell>
                  <TableCell className="text-right tabular font-semibold">
                    {formatINR(b.typical_inr)}
                  </TableCell>
                  <TableCell className="text-right tabular text-muted-foreground">
                    {formatINR(b.high_inr)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function Extras({ result }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Cost drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {result.cost_drivers?.map((d, i) => (
              <li key={`driver-${i}-${d.slice(0, 24)}`} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Savings tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {result.savings_tips?.map((d, i) => (
              <li key={`tip-${i}-${d.slice(0, 24)}`} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Questions to ask</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm list-decimal pl-5">
            {result.questions_to_ask?.map((q, i) => (
              <li key={`q-${i}-${q.slice(0, 24)}`}>{q}</li>
            ))}
          </ol>
        </CardContent>
      </Card>
      {result.caveats?.length > 0 && (
        <div className="lg:col-span-3">
          <InlineAlert tone="warning" title="Important caveats">
            <ul className="list-disc pl-5 space-y-1">
              {result.caveats.slice(0, 6).map((c, i) => (
                <li key={`caveat-${i}-${c.slice(0, 24)}`}>{c}</li>
              ))}
            </ul>
          </InlineAlert>
        </div>
      )}
    </div>
  );
}

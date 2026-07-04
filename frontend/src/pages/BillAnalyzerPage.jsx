import { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Copy,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { api, humanError } from '@/lib/api';
import { formatINR, formatPercent } from '@/lib/format';
import { InlineAlert } from '@/components/common/State';
import { TEST_IDS } from '@/constants/testIds';

const SAMPLE_BILL = `APOLLO HOSPITAL, DELHI
PATIENT: Ramesh Kumar (M, 54)
ADMISSION: 12-Mar-2026 to 17-Mar-2026 (5 nights)
DIAGNOSIS: Laparoscopic Appendectomy
---------------------------------------------
ITEM                              QTY   AMOUNT (INR)
---------------------------------------------
General Ward Room Rent            5     45,000
ICU Charges (post-op)             2     72,000
Surgeon Fee - Appendectomy        1     85,000
Anaesthesia                       1     35,000
OT Charges                        1     42,000
Consumables (surgical)            1     58,000
Laparoscopic Instruments Kit      1     46,000
Nursing Charges                   5     18,500
Physiotherapy (post-op)           2     14,000
Diagnostics (CBC, LFT, KFT)       3     11,200
Ultrasound Abdomen                1      3,800
ECG                               2      2,400
X-Ray Chest                       1      1,400
Medicines (as per pharmacy bill)  -     28,600
IV Fluids and Injectables         -     14,300
Doctor Visits (Consultant)        6     18,000
Doctor Visits (Registrar)         8      9,600
Dietician Consultation            2      3,200
Biomedical Waste Charges          5      2,500
Registration & Admission Fee      1      2,000
Discharge Summary                 1      1,500
Miscellaneous Charges             -     12,400
---------------------------------------------
TOTAL                                   5,26,400`;

const FLAG_STYLE = {
  ok: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900',
  watch: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900',
  suspect: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900',
  overcharge: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900',
};

const SEVERITY_STYLE = {
  info: 'text-sky-600',
  warning: 'text-amber-600',
  critical: 'text-red-600',
};

export default function BillAnalyzerPage() {
  const [billText, setBillText] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [city, setCity] = useState('');
  const [tier, setTier] = useState('private');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e?.preventDefault();
    if (!billText || billText.trim().length < 20) {
      toast.error('Paste your bill (at least 20 characters).');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/ai/bill-analyze', {
        bill_text: billText,
        hospital_name: hospitalName || null,
        city: city || null,
        hospital_tier: tier || null,
      });
      setResult(data);
    } catch (err) {
      toast.error(humanError(err));
    } finally {
      setLoading(false);
    }
  };

  const copyQuestions = async () => {
    if (!result?.questions_to_ask?.length) return;
    const text = result.questions_to_ask
      .map((q, i) => `${i + 1}. ${q}`)
      .join('\n');
    await navigator.clipboard.writeText(text);
    toast.success('Dispute questions copied');
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8 py-8 space-y-6">
      <header className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 flex items-center justify-center">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">AI Bill Fraud Detector</div>
          <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">
            Analyze a hospital bill
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl text-sm">
            Paste the itemised bill. Our AI compares each line to Indian market
            rates, flags overcharges, and drafts dispute questions.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Bill details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hospital">Hospital (optional)</Label>
                  <Input
                    id="hospital"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g., Apollo Delhi"
                    data-testid={TEST_IDS.bill.hospitalName}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City (optional)</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Delhi, Mumbai…"
                    data-testid={TEST_IDS.bill.cityInput}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Hospital tier</Label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="trust">Trust</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bill">Bill text</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setBillText(SAMPLE_BILL)}
                  >
                    <FileText className="h-4 w-4 mr-1.5" /> Use sample bill
                  </Button>
                </div>
                <Textarea
                  id="bill"
                  value={billText}
                  onChange={(e) => setBillText(e.target.value)}
                  rows={14}
                  placeholder="Paste your itemised hospital bill here. Include line items, quantities, and amounts."
                  className="font-mono text-xs"
                  data-testid={TEST_IDS.bill.textarea}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-5"
                  data-testid={TEST_IDS.bill.submit}
                >
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  {loading ? 'Analyzing… ~20s' : 'Analyze with AI'}
                  {!loading && <ArrowRight className="ml-1.5 h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setBillText('');
                    setResult(null);
                    setHospitalName('');
                    setCity('');
                  }}
                >
                  Clear
                </Button>
              </div>
              <InlineAlert tone="info" title="Privacy first">
                Your bill is sent to our AI provider (Claude Sonnet 4.5) for
                analysis and is not stored publicly. AI is a decision-support
                tool — always confirm with the hospital and your doctor.
              </InlineAlert>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <Card className="border-border">
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : result ? (
            <ResultSummary result={result} onCopyQuestions={copyQuestions} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-8 pb-8 text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div className="font-semibold">Your report will appear here</div>
                <div className="text-sm text-muted-foreground max-w-sm mx-auto">
                  We&apos;ll show a total-vs-fair summary, line-item flags,
                  concern explanations, and dispute-ready questions.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <LineItemsTable result={result} />
          <FlagsAccordion result={result} />
          <NextSteps result={result} />
        </motion.div>
      )}
    </div>
  );
}

function ResultSummary({ result, onCopyQuestions }) {
  const s = result.summary;
  const pct = Number(s.overcharge_percent || 0);
  return (
    <Card
      className="border-border"
      data-testid={TEST_IDS.bill.resultSummary}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Audit summary</CardTitle>
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Total billed
            </div>
            <div className="tabular text-xl font-semibold mt-1">
              {formatINR(s.total_billed_inr)}
            </div>
          </div>
          <div className="rounded-xl border border-border p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Fair estimate
            </div>
            <div className="tabular text-xl font-semibold mt-1">
              {formatINR(s.estimated_fair_inr)}
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
            <div className="text-[10px] uppercase tracking-wide text-amber-800 dark:text-amber-200">
              Potential overcharge
            </div>
            <div className="tabular text-xl font-semibold mt-1 text-amber-900 dark:text-amber-100">
              {formatINR(s.potential_overcharge_inr)}
            </div>
            <div className="text-[11px] text-amber-800 dark:text-amber-200 mt-0.5">
              {formatPercent(pct, 1)}
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Overcharge share of bill</span>
            <span className="tabular font-medium">{formatPercent(pct, 0)}</span>
          </div>
          <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
            <div
              className={`h-full ${
                pct >= 20
                  ? 'bg-gradient-to-r from-amber-500 to-red-500'
                  : pct >= 10
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>
        {result.questions_to_ask?.length > 0 && (
          <Button variant="outline" size="sm" onClick={onCopyQuestions}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy dispute questions ({result.questions_to_ask.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function LineItemsTable({ result }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">
          Line-by-line analysis ({result.line_items?.length || 0} items)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Billed</TableHead>
                <TableHead className="text-right">Fair</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Flag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(result.line_items || []).map((li, i) => (
                <TableRow key={`${li.description}-${li.billed_amount_inr}-${i}`}>
                  <TableCell>
                    <div className="font-medium">{li.description}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                      {li.reason}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular font-medium">
                    {formatINR(li.billed_amount_inr)}
                  </TableCell>
                  <TableCell className="text-right tabular text-muted-foreground">
                    {formatINR(li.fair_amount_inr)}
                  </TableCell>
                  <TableCell className="text-right tabular">
                    <span
                      className={
                        li.variance_inr > 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : li.variance_inr < 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      }
                    >
                      {li.variance_inr > 0 ? '+' : ''}
                      {formatINR(li.variance_inr)}
                    </span>
                    <div className="text-[10px] text-muted-foreground">
                      {formatPercent(li.variance_percent, 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${FLAG_STYLE[li.flag] || ''}`}
                    >
                      {li.flag}
                    </Badge>
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

function FlagsAccordion({ result }) {
  if (!result.flags?.length) return null;
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Concerns explained
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {result.flags.map((f, i) => (
            <AccordionItem value={`f-${f.code || i}`} key={f.code || `flag-${i}`}>
              <AccordionTrigger className="text-left">
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      f.severity === 'critical'
                        ? 'bg-red-500'
                        : f.severity === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-sky-500'
                    }`}
                  />
                  <span className={`text-sm font-medium ${SEVERITY_STYLE[f.severity] || ''}`}>
                    {f.title}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p className="leading-relaxed">{f.explanation}</p>
                  {f.evidence && (
                    <div className="rounded-lg bg-surface-2 border border-border p-3 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Evidence: </span>
                      {f.evidence}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function NextSteps({ result }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Recommended next steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.next_steps?.length > 0 && (
          <ol className="space-y-2 text-sm list-decimal pl-5">
            {result.next_steps.map((s, i) => (
              <li key={`step-${i}-${s.slice(0, 24)}`} className="leading-relaxed">
                {s}
              </li>
            ))}
          </ol>
        )}
        {result.questions_to_ask?.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Questions to ask the hospital
            </div>
            <ul className="space-y-2 text-sm">
              {result.questions_to_ask.map((q, i) => (
                <li key={`q-${i}-${q.slice(0, 24)}`} className="flex gap-2">
                  <span className="tabular text-muted-foreground font-medium">
                    Q{i + 1}.
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.caveats?.length > 0 && (
          <InlineAlert tone="warning" title="Important caveats">
            <ul className="list-disc pl-5 space-y-1">
              {result.caveats.slice(0, 6).map((c, i) => (
                <li key={`caveat-${i}-${c.slice(0, 24)}`}>{c}</li>
              ))}
            </ul>
          </InlineAlert>
        )}
      </CardContent>
    </Card>
  );
}

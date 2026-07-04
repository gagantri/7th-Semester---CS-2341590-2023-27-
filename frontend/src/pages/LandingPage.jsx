import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hospital,
  ShieldAlert,
  Calculator,
  Siren,
  FolderLock,
  IndianRupee,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/brand/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { TEST_IDS } from '@/constants/testIds';

const FEATURES = [
  {
    icon: Hospital,
    title: 'Compare hospitals like flights',
    body:
      'Side-by-side pricing, live bed availability, ratings and Value Score across 30+ Indian hospitals.',
    to: '/hospitals',
  },
  {
    icon: ShieldAlert,
    title: 'AI catches hospital overcharges',
    body:
      'Paste your bill — Claude Sonnet 4.5 flags double billing, opaque “misc” charges, and drafts dispute letters.',
    to: '/bill-analyzer',
  },
  {
    icon: Calculator,
    title: 'Realistic treatment estimates',
    body:
      'City-adjusted cost ranges with itemised breakdown, cost drivers, and savings tips before you admit.',
    to: '/cost-estimator',
  },
  {
    icon: Siren,
    title: 'Emergency care in two taps',
    body:
      'GPS-nearest 24×7 hospitals + one-tap 108/112 dial with your location, even on low-bandwidth networks.',
    to: '/emergency',
  },
  {
    icon: FolderLock,
    title: 'Encrypted health records vault',
    body:
      'Lab reports, prescriptions, discharge summaries, imaging — organised, searchable, and yours.',
    to: '/vault',
  },
  {
    icon: Sparkles,
    title: 'Bharat-native. Multilingual.',
    body:
      'English and Hindi first, regional languages next. Works on ₹5K Android phones and low-bandwidth networks.',
    to: '/hospitals',
  },
];

const STATS = [
  { value: '340M+', label: 'patients treated annually in India' },
  { value: '70%', label: 'healthcare costs paid out-of-pocket' },
  { value: '60–70%', label: 'of hospital bills contain inflated charges' },
  { value: '₹5.6L Cr', label: 'Indian healthcare market' },
];

function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-4 px-4 md:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={30} />
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-4">
          <a
            href="#features"
            className="h-9 px-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            Features
          </a>
          <a
            href="#how"
            className="h-9 px-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            How it works
          </a>
          <a
            href="#mission"
            className="h-9 px-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            Mission
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login" data-testid={TEST_IDS.landing.loginLink}>
              Log in
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup" data-testid={TEST_IDS.landing.signupLink}>
              Get started
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* HERO */}
      <section className="relative overflow-hidden hero-mesh noise-overlay">
        <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8 pt-14 pb-20 md:pt-24 md:pb-32">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
            <div>
              <Badge
                variant="secondary"
                className="mb-5 rounded-full px-3 py-1 border border-border"
              >
                <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Now live — Powered by Claude Sonnet 4.5
              </Badge>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]"
              >
                Clarity in healthcare.{' '}
                <span className="gradient-text">Confidence in every decision.</span>
              </motion.h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-[560px] leading-relaxed">
                GavixaCare gives every Indian family the price transparency, AI
                bill audits, and emergency navigation that hospitals never
                offered. Before you pay, know what you’re paying for.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild className="h-12 px-6">
                  <Link
                    to="/signup"
                    data-testid={TEST_IDS.landing.heroPrimaryCta}
                  >
                    Try free bill analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 px-6"
                >
                  <Link
                    to="/hospitals"
                    data-testid={TEST_IDS.landing.heroSecondaryCta}
                  >
                    Compare hospitals
                  </Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ABDM-aligned architecture
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  DPDP-ready privacy model
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Works on mid-range Android
                </span>
              </div>
            </div>

            {/* Product visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl -z-10" />
              <div className="card-elevated rounded-2xl p-5 md:p-6 relative">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span className="inline-flex items-center gap-2">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Bill analyzer preview
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>
                <div className="rounded-xl border border-border bg-surface-2 p-4">
                  <div className="flex items-baseline justify-between">
                    <div className="text-sm text-muted-foreground">
                      Total billed
                    </div>
                    <div className="tabular text-2xl font-semibold">
                      ₹5,26,400
                    </div>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <div className="text-sm text-muted-foreground">
                      Fair estimate
                    </div>
                    <div className="tabular text-lg text-foreground">
                      ₹3,84,000
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-red-500"
                      style={{ width: '73%' }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Potential overcharge</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      ₹1,42,400 (27%)
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Flagged
                    </div>
                    <div className="tabular text-lg font-semibold">6</div>
                    <div className="text-xs text-muted-foreground">line items</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Confidence
                    </div>
                    <div className="tabular text-lg font-semibold text-emerald-600">
                      High
                    </div>
                    <div className="text-xs text-muted-foreground">AI audit</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trust row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-4 md:p-5"
              >
                <div className="tabular text-2xl md:text-3xl font-semibold tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1 text-xs md:text-sm text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 md:py-24 border-t border-border">
        <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-sm font-medium text-primary uppercase tracking-wide">
              What GavixaCare does
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Six tools that put patients back in control.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built for the way Indian families actually experience the
              healthcare system — with radical transparency, honest AI, and
              respect for your time and money.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                data-testid={TEST_IDS.landing.featureCard}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="py-16 md:py-24 border-t border-border bg-surface-2"
      >
        <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-sm font-medium text-accent uppercase tracking-wide">
              How it works
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Three steps to healthcare confidence.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                n: '01',
                t: 'Find the right hospital',
                d: 'Search by city, specialty, and budget. See side-by-side Value Scores and live bed availability.',
              },
              {
                n: '02',
                t: 'Estimate before you admit',
                d: 'Our AI gives realistic cost ranges with what drives the number — room, surgeon, implants, ICU.',
              },
              {
                n: '03',
                t: 'Audit every bill you pay',
                d: 'Paste or upload the final bill. AI flags overcharges and drafts your dispute letter automatically.',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="tabular text-sm font-semibold text-primary">
                  {step.n}
                </div>
                <div className="mt-2 font-semibold text-lg">{step.t}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section id="mission" className="py-16 md:py-24 border-t border-border">
        <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-sm font-medium text-primary uppercase tracking-wide">
                Our mission
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
                Rebuild the trust between patients and Indian healthcare.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                No Indian family should be financially destroyed by a medical
                event they could not predict or prepare for. GavixaCare is
                infrastructure for radical transparency: verified data,
                honest AI, and patient-first design. Made in Bharat, for
                Bharat.
              </p>
              <div className="mt-6 flex gap-3">
                <Button asChild size="lg">
                  <Link to="/signup">Create free account</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">I have an account</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Hospitals seeded', value: '32', sub: 'across 11 cities' },
                { label: 'Cities covered', value: '11', sub: 'metro + tier-2' },
                {
                  label: 'Specialties tracked',
                  value: '20+',
                  sub: 'cardiac → oncology',
                },
                {
                  label: 'Public helplines',
                  value: '7',
                  sub: '108/112/102 and more',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="stat-value mt-1">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={26} />
            <span className="text-xs text-muted-foreground">
              A Gavixa product · Made in India
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Medical disclaimer
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

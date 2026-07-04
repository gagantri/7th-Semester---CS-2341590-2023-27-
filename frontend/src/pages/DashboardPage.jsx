import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hospital,
  ShieldAlert,
  Calculator,
  Siren,
  FolderLock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const ACTIONS = [
  {
    icon: Hospital,
    title: 'Compare hospitals',
    body: 'Find the right hospital by value score, price, and beds.',
    to: '/hospitals',
    tone: 'primary',
  },
  {
    icon: ShieldAlert,
    title: 'Analyze a hospital bill',
    body: 'Paste your bill — AI flags overcharges in seconds.',
    to: '/bill-analyzer',
    tone: 'warning',
  },
  {
    icon: Calculator,
    title: 'Estimate treatment cost',
    body: 'Realistic city-adjusted ranges before you admit.',
    to: '/cost-estimator',
    tone: 'accent',
  },
  {
    icon: Siren,
    title: 'Emergency near me',
    body: 'Nearest 24×7 hospital + one-tap 108/112.',
    to: '/emergency',
    tone: 'danger',
  },
  {
    icon: FolderLock,
    title: 'Health records vault',
    body: 'Upload lab reports, prescriptions, imaging.',
    to: '/vault',
    tone: 'muted',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8 py-8 md:py-10 space-y-8">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Namaste,</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">
              {firstName}. What can we clarify today?
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground rounded-full border border-border px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI powered by Claude Sonnet 4.5
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.04 }}
          >
            <Link to={a.to} className="block group">
              <Card className="border-border hover:border-primary/30 hover:shadow-lg transition-all">
                <CardContent className="pt-6 pb-5 space-y-3">
                  <ToneIcon icon={a.icon} tone={a.tone} />
                  <div>
                    <div className="font-semibold text-lg">{a.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {a.body}
                    </div>
                  </div>
                  <div className="inline-flex items-center text-sm text-primary font-medium">
                    Open
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Quick tips */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border lg:col-span-2">
          <CardContent className="pt-6 space-y-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Patient tip
            </div>
            <div className="text-lg font-medium">
              Before signing any hospital estimate, ask for a written package
              rate.
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Package rates prevent surprise consumables, discharge summary
              fees, and “miscellaneous” line-items. When a hospital declines
              to give you one, treat it as a negotiation signal — not a fixed
              price.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/cost-estimator">Estimate your procedure</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6 space-y-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Emergency contacts
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>National emergency</span>
                <a href="tel:112" className="tabular font-semibold text-primary">
                  112
                </a>
              </li>
              <li className="flex items-center justify-between">
                <span>Ambulance</span>
                <a href="tel:108" className="tabular font-semibold text-primary">
                  108
                </a>
              </li>
              <li className="flex items-center justify-between">
                <span>Medical helpline</span>
                <a href="tel:102" className="tabular font-semibold text-primary">
                  102
                </a>
              </li>
              <li className="flex items-center justify-between">
                <span>Blood bank</span>
                <a href="tel:1910" className="tabular font-semibold text-primary">
                  1910
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ToneIcon({ icon: Icon, tone }) {
  const cls =
    {
      primary: 'bg-primary/10 text-primary',
      accent: 'bg-accent/10 text-accent',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      danger: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
      muted: 'bg-muted text-foreground',
    }[tone] || 'bg-primary/10 text-primary';
  return (
    <div className={`h-11 w-11 rounded-xl inline-flex items-center justify-center ${cls}`}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

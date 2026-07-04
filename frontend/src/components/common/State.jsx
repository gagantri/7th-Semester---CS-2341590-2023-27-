import { AlertTriangle, ShieldCheck, Info, Search } from 'lucide-react';
import PropTypes from 'prop-types';

export function EmptyState({ icon: Icon = Search, title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center flex flex-col items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        {description && (
          <div className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            {description}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.any,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  action: PropTypes.node,
};

export function InlineAlert({ tone = 'info', title, children }) {
  const map = {
    info: {
      icon: Info,
      cls: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100',
    },
    success: {
      icon: ShieldCheck,
      cls: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100',
    },
    warning: {
      icon: AlertTriangle,
      cls: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100',
    },
    danger: {
      icon: AlertTriangle,
      cls: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100',
    },
  };
  const { icon: Icon, cls } = map[tone] || map.info;
  return (
    <div className={`rounded-xl border p-4 flex gap-3 ${cls}`}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  );
}

InlineAlert.propTypes = {
  tone: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  title: PropTypes.node,
  children: PropTypes.node,
};

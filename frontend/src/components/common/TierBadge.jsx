import PropTypes from 'prop-types';
import { classNames } from '@/lib/format';

export function TierBadge({ tier, className }) {
  const map = {
    government: {
      label: 'Government',
      bg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900',
    },
    trust: {
      label: 'Trust',
      bg: 'bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200 border-sky-200 dark:border-sky-900',
    },
    private: {
      label: 'Private',
      bg: 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border-amber-200 dark:border-amber-900',
    },
    premium: {
      label: 'Premium',
      bg: 'bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200 border-violet-200 dark:border-violet-900',
    },
  };
  const cfg = map[tier] || map.private;
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        cfg.bg,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}

TierBadge.propTypes = {
  tier: PropTypes.string,
  className: PropTypes.string,
};

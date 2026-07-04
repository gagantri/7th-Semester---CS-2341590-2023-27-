import PropTypes from 'prop-types';
import { classNames } from '@/lib/format';

/**
 * Circular ring for showing a 0-100 score.
 */
export function ScoreRing({ value = 0, size = 96, stroke = 8, label, className }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;

  return (
    <div
      className={classNames('inline-flex flex-col items-center', className)}
      role="img"
      aria-label={`${label ?? 'Score'} ${clamped} out of 100`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="hsl(var(--surface-3))"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${c}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 400ms cubic-bezier(0.2,0.8,0.2,1)' }}
          />
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="hsl(var(--primary))" />
              <stop offset="1" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="tabular text-2xl font-semibold leading-none">{clamped}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
            /100
          </div>
        </div>
      </div>
      {label && (
        <div className="mt-2 text-xs font-medium text-muted-foreground">{label}</div>
      )}
    </div>
  );
}

ScoreRing.propTypes = {
  value: PropTypes.number,
  size: PropTypes.number,
  stroke: PropTypes.number,
  label: PropTypes.string,
  className: PropTypes.string,
};

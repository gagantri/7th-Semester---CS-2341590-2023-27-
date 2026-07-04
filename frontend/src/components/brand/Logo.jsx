import PropTypes from 'prop-types';
import { classNames } from '@/lib/format';

/**
 * GavixaCare Logo
 * A rounded-square 'plus-cross' mark inside a swoosh, in navy + teal.
 * Uses currentColor for the wordmark to adapt to light/dark themes.
 */
export function Logo({ withText = true, size = 32, className }) {
  const s = size;
  return (
    <span className={classNames('inline-flex items-center gap-2', className)}>
      <svg
        width={s}
        height={s}
        viewBox="0 0 40 40"
        role="img"
        aria-label="GavixaCare logo"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gvx-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1A56DB" />
            <stop offset="1" stopColor="#0D9E8B" />
          </linearGradient>
        </defs>
        <path
          d="M6 20a14 14 0 1 1 25.5 8.1"
          stroke="url(#gvx-a)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="20" cy="20" r="9.5" fill="url(#gvx-a)" />
        <path
          d="M20 15v10M15 20h10"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      {withText && (
        <span className="font-semibold tracking-tight text-[15px] leading-none">
          <span className="text-foreground">Gavixa</span>
          <span className="text-primary">Care</span>
        </span>
      )}
    </span>
  );
}

Logo.propTypes = {
  withText: PropTypes.bool,
  size: PropTypes.number,
  className: PropTypes.string,
};

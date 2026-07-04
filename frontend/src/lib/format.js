/**
 * Currency and number formatters for GavixaCare.
 * Consistent Indian Rupee formatting across the app.
 */

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const INR_COMPACT = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  notation: 'compact',
});

export function formatINR(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  return INR.format(Number(n));
}

export function formatINRCompact(n) {
  if (n === null || n === undefined) return '—';
  const value = Number(n);
  if (Number.isNaN(value)) return '—';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return INR_COMPACT.format(value);
}

export function formatPercent(n, digits = 0) {
  if (n === null || n === undefined) return '—';
  return `${Number(n).toFixed(digits)}%`;
}

export function classNames(...cls) {
  return cls.filter(Boolean).join(' ');
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
}

export function initialsOf(name) {
  if (!name) return '?';
  const words = String(name).trim().split(/\s+/);
  return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

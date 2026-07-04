import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Hospital,
  Calculator,
  Siren,
  FolderLock,
} from 'lucide-react';

const ITEMS = [
  { to: '/app', icon: LayoutGrid, label: 'Home' },
  { to: '/hospitals', icon: Hospital, label: 'Hospitals' },
  { to: '/cost-estimator', icon: Calculator, label: 'Estimate' },
  { to: '/emergency', icon: Siren, label: 'Emergency', danger: true },
  { to: '/vault', icon: FolderLock, label: 'Vault' },
];

export function BottomNav() {
  const location = useLocation();
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, icon: Icon, label, danger }) => {
          const active =
            location.pathname === to ||
            (to !== '/app' && location.pathname.startsWith(to));
          return (
            <li key={to}>
              <Link
                to={to}
                data-testid={`bottomnav-${to.replace('/', '')}`}
                className={`min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                  active
                    ? danger
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    active && danger ? 'text-red-600 dark:text-red-400' : ''
                  }`}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

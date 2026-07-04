import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/brand/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { initialsOf } from '@/lib/format';
import { TEST_IDS } from '@/constants/testIds';

const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard' },
  { to: '/hospitals', label: 'Hospitals' },
  { to: '/bill-analyzer', label: 'Bill Analyzer' },
  { to: '/cost-estimator', label: 'Cost Estimator' },
  { to: '/emergency', label: 'Emergency' },
  { to: '/vault', label: 'Health Vault' },
];

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 md:px-6 lg:px-8">
        <Link to={user ? '/app' : '/'} className="flex items-center gap-2">
          <Logo size={28} />
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_ITEMS.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to !== '/app' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center h-9 px-3 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  data-testid={`topbar-nav-${item.to.replace('/', '')}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid={TEST_IDS.layout.userMenu}
                  className="rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    {user.picture && <AvatarImage src={user.picture} alt={user.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {initialsOf(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  data-testid={TEST_IDS.layout.logoutButton}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild size="sm">
                <Link to="/login" data-testid={TEST_IDS.landing.loginLink}>
                  Log in
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup" data-testid={TEST_IDS.landing.signupLink}>
                  Get started
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

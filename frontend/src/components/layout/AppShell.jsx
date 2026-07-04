import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/context/AuthContext';

export function AppShell({ children }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <main className="flex-1 pb-20 md:pb-8">
        {children ?? <Outlet />}
      </main>
      {user && <BottomNav />}
    </div>
  );
}

AppShell.propTypes = { children: PropTypes.node };

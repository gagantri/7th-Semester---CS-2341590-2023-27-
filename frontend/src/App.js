import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import AuthCallback from '@/pages/auth/AuthCallback';
import DashboardPage from '@/pages/DashboardPage';
import HospitalsListPage from '@/pages/hospitals/HospitalsListPage';
import HospitalDetailPage from '@/pages/hospitals/HospitalDetailPage';
import HospitalComparePage from '@/pages/hospitals/HospitalComparePage';
import BillAnalyzerPage from '@/pages/BillAnalyzerPage';
import CostEstimatorPage from '@/pages/CostEstimatorPage';
import EmergencyPage from '@/pages/EmergencyPage';
import VaultPage from '@/pages/VaultPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

import '@/App.css';

/**
 * Detect OAuth callback fragment synchronously (not in useEffect) to avoid
 * race with AuthContext.checkAuth().
 */
function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Public browsing (no auth required) */}
      <Route
        path="/hospitals"
        element={
          <AppShell>
            <HospitalsListPage />
          </AppShell>
        }
      />
      <Route
        path="/hospitals/compare"
        element={
          <AppShell>
            <HospitalComparePage />
          </AppShell>
        }
      />
      <Route
        path="/hospitals/:id"
        element={
          <AppShell>
            <HospitalDetailPage />
          </AppShell>
        }
      />
      <Route
        path="/bill-analyzer"
        element={
          <AppShell>
            <BillAnalyzerPage />
          </AppShell>
        }
      />
      <Route
        path="/cost-estimator"
        element={
          <AppShell>
            <CostEstimatorPage />
          </AppShell>
        }
      />
      <Route
        path="/emergency"
        element={
          <AppShell>
            <EmergencyPage />
          </AppShell>
        }
      />

      {/* Authenticated area */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vault"
        element={
          <ProtectedRoute>
            <AppShell>
              <VaultPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppShell>
              <SettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

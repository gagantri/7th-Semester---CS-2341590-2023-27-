import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/context/AuthContext';
import { humanError } from '@/lib/api';

/**
 * Handles the return from Emergent OAuth. The URL fragment contains
 * `#session_id=...` — we swap that for a persistent app session.
 */
export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithGoogleSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = location.hash || window.location.hash || '';
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate('/login', { replace: true });
      return;
    }
    const sessionId = decodeURIComponent(match[1]);

    (async () => {
      try {
        const user = await loginWithGoogleSession(sessionId);
        toast.success(`Welcome, ${user.name.split(' ')[0]}`);
        // Clean the URL fragment and land on dashboard
        window.history.replaceState(null, '', '/app');
        navigate('/app', { replace: true, state: { user } });
      } catch (err) {
        toast.error(humanError(err));
        navigate('/login', { replace: true });
      }
    })();
  }, [location.hash, loginWithGoogleSession, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Logo size={28} />
        <span className="text-sm">Signing you in…</span>
      </div>
    </div>
  );
}

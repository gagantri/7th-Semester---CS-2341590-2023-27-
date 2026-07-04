import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, humanError } from '@/lib/api';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refresh: async () => {},
  loginWithGoogleSession: async () => {},
  humanError,
});

/**
 * Auth state provider. Reads/writes only via the httpOnly `session_token`
 * cookie the backend sets — no tokens ever touch localStorage.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (
      typeof window !== 'undefined' &&
      window.location.hash?.includes('session_id=')
    ) {
      // AuthCallback will handle the exchange; skip preflight probe.
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogleSession = useCallback(async (sessionId) => {
    const { data } = await api.post('/auth/google/session', {
      session_id: sessionId,
    });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* best-effort */
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      refresh,
      loginWithGoogleSession,
      humanError,
    }),
    [user, loading, login, signup, logout, refresh, loginWithGoogleSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

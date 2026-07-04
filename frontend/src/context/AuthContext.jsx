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
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // If returning from OAuth callback, let AuthCallback handle it first.
    if (typeof window !== 'undefined' && window.location.hash?.includes('session_id=')) {
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
    localStorage.setItem('gavixa_token', data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    localStorage.setItem('gavixa_token', data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogleSession = useCallback(async (sessionId) => {
    const { data } = await api.post('/auth/google/session', { session_id: sessionId });
    // For Google auth we rely on cookie; clear any JWT.
    localStorage.removeItem('gavixa_token');
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('gavixa_token');
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

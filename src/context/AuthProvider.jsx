import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.js';
import { setUnauthorizedHandler } from '../api/client.js';
import { AuthContext } from './authContext.js';

// Keeps the logged-in user in one place for the whole app.
// On page load it calls /api/auth/me to restore the session from the stored token.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));

    let cancelled = false;
    authApi
      .getCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const u = await authApi.login(credentials);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (details) => {
    const u = await authApi.register(details);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

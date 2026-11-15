import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.js';
import { setUnauthorizedHandler } from '../api/client.js';
import { AuthContext } from './authContext.js';

const DEMO_ID = 'demo@campaignconnect.test';
const DEMO_PASSWORD = 'Demo123!';
const DEMO_SESSION_KEY = 'campaign_demo_session';
const demoUser = { id: DEMO_ID, email: DEMO_ID, name: 'Demo User' };

function hasDemoSession() {
  try {
    return localStorage.getItem(DEMO_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

function setDemoSession(isAuthenticated) {
  try {
    if (isAuthenticated) {
      localStorage.setItem(DEMO_SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(DEMO_SESSION_KEY);
    }
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

// Keeps the logged-in user in one place for the whole app.
// Demo sessions are restored locally; API sessions still use the stored token.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (hasDemoSession() ? demoUser : null));
  const loading = false;

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  const login = useCallback(async (credentials) => {
    if (credentials.email !== DEMO_ID || credentials.password !== DEMO_PASSWORD) {
      throw new Error('Invalid ID or password.');
    }
    setDemoSession(true);
    setUser(demoUser);
    return demoUser;
  }, []);

  const register = useCallback(async (details) => {
    const u = await authApi.register(details);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    setDemoSession(false);
    authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore, setUnauthorizedHandler } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [meta, setMeta] = useState(null);
  const [checking, setChecking] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => { tokenStore.clear(); setUser(null); setMeta(null); }, []);
  useEffect(() => setUnauthorizedHandler(logout), [logout]);

  const loadSession = useCallback(async () => {
    const [me, m] = await Promise.all([api('/auth/me'), api('/meta')]);
    setUser(me); setMeta(m);
  }, []);

  useEffect(() => {
    if (!tokenStore.get()) return;
    loadSession().catch(logout).finally(() => setChecking(false));
  }, [loadSession, logout]);

  const login = useCallback(async (email, password) => {
    const { token } = await api('/auth/login', { method: 'POST', body: { email, password } });
    tokenStore.set(token);
    await loadSession();
  }, [loadSession]);

  const value = useMemo(() => ({ user, meta, checking, login, logout }), [user, meta, checking, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    globalThis.addEventListener('auth:expired', onExpired);
    return () => globalThis.removeEventListener('auth:expired', onExpired);
  }, []);

  const finish = useCallback((data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email, password) => finish(await api('/auth/login', { method: 'POST', body: { email, password } })),
    [finish]
  );
  const register = useCallback(
    async (name, email, password) => finish(await api('/auth/register', { method: 'POST', body: { name, email, password } })),
    [finish]
  );
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
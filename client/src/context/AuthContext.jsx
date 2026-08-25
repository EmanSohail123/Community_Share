import { createContext, useContext, useState } from 'react';
import { request } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('communityshare_token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('communityshare_user') || 'null'));

  function saveSession(session) {
    localStorage.setItem('communityshare_token', session.token);
    localStorage.setItem('communityshare_user', JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
  }

  async function login(credentials) {
    const session = await request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    saveSession(session);
  }

  async function register(details) {
    const session = await request('/auth/register', { method: 'POST', body: JSON.stringify(details) });
    saveSession(session);
  }

  function logout() {
    localStorage.removeItem('communityshare_token');
    localStorage.removeItem('communityshare_user');
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ token, user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

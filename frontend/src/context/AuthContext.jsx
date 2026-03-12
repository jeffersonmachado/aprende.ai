import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken, setUnauthorizedHandler } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('aprende_ai_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem('aprende_ai_token');
      setToken(null);
      setUser(null);
    });
  }, []);

  useEffect(() => {
    async function bootstrap() {
      if (!token) return;
      try {
        const data = await api.get('/api/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('aprende_ai_token');
        setToken(null);
        setUser(null);
      }
    }

    bootstrap();
  }, [token]);

  async function login(email, password) {
    const data = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('aprende_ai_token', data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem('aprende_ai_token');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser utilizado dentro de AuthProvider');
  }
  return context;
}

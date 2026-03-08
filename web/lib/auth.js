'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { login as apiLogin, register as apiRegister, getMe } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = Cookies.get('fiestapp_token');
    if (!token) { setLoading(false); return; }
    try {
      const data = await getMe();
      setUser(data.user);
    } catch {
      Cookies.remove('fiestapp_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    Cookies.set('fiestapp_token', data.token, { expires: 30 });
    setUser(data.user);
    return data;
  };

  const register = async (info) => {
    const data = await apiRegister(info);
    Cookies.set('fiestapp_token', data.token, { expires: 30 });
    setUser(data.user);
    return data;
  };

  const logout = () => {
    Cookies.remove('fiestapp_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

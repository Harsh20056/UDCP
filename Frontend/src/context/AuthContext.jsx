import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance.js';
import { ENDPOINTS } from '../api/endpoints.js';
import { can } from '../utils/permissions.js';

export const AuthContext = createContext(null);

const SESSION_KEY = 'udcp_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // ─── Restore session on mount ───────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.exp && Date.now() < session.exp) {
          setUser(session.user);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  // ─── Login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await axiosInstance.post(ENDPOINTS.AUTH_LOGIN, { email, password });
    const { token, user: loggedInUser } = res.data;
    const session = {
      token,
      user: loggedInUser,
      exp: Date.now() + 8 * 3600 * 1000, // 8h
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  // ─── Permission check ────────────────────────────────────────────────────
  const hasPermission = useCallback((action, context = {}) => {
    return can(user, action, context);
  }, [user]);

  // ─── Update user (e.g. after profile edit) ───────────────────────────────
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        session.user = updated;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
      return updated;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    updateUser,
  }), [user, loading, login, logout, hasPermission, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

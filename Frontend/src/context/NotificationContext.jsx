import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import axiosInstance from '../api/axiosInstance.js';
import { ENDPOINTS } from '../api/endpoints.js';
import { AuthContext } from './AuthContext.jsx';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const { isAuthenticated } = useContext(AuthContext);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(ENDPOINTS.NOTIFICATIONS);
      setNotifications(res.data.data || []);
    } catch {
      // Silently fail — notification fetch is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + simulated push every 20s (only when authenticated)
  useEffect(() => {
    // Only poll when user is authenticated
    if (!isAuthenticated) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Clear notifications when logged out
      setNotifications([]);
      return;
    }

    // User is authenticated, start polling
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 20000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await axiosInstance.post(ENDPOINTS.NOTIFICATION_READ(id));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      // Optimistic update already done; ignore error
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }), [notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

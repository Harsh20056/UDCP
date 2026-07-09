import axios from 'axios';
import { ENV } from '../config/env.js';

const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor — attach auth token ──────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem('udcp_session');
    if (session) {
      try {
        const { token } = JSON.parse(session);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Invalid session, ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — handle auth errors globally ───────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session and redirect to login (only if not already on login page)
      localStorage.removeItem('udcp_session');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

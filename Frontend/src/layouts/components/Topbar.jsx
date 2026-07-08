import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, Bell, Moon, Sun, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext.jsx';
import { ROUTES } from '../../routes/routeConfig.js';
import { getInitials } from '../../utils/formatters.js';
import { timeAgo } from '../../utils/dateUtils.js';
import { cn } from '../../lib/utils.js';

export default function Topbar({ title = 'Operations Dashboard' }) {
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useContext(ThemeContext);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  const searchablePaths = [ROUTES.PROJECTS, ROUTES.CONFLICTS, ROUTES.APPROVALS, ROUTES.NOTIFICATIONS, ROUTES.AUDIT_LOGS];
  const isSearchablePage = searchablePaths.includes(pathname);

  let searchPlaceholder = 'Search projects...';
  if (pathname === ROUTES.CONFLICTS) searchPlaceholder = 'Search conflicts, roads...';
  else if (pathname === ROUTES.APPROVALS) searchPlaceholder = 'Search approvals by project/dept...';
  else if (pathname === ROUTES.NOTIFICATIONS) searchPlaceholder = 'Search notifications...';
  else if (pathname === ROUTES.AUDIT_LOGS) searchPlaceholder = 'Search audit logs by user...';

  const notifRef = useRef();
  const userRef = useRef();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const recentNotifs = notifications.slice(0, 5);

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white dark:bg-slate-900 dark:bg-gray-900 border-b border-slate-200 dark:border-slate-700 dark:border-gray-700 z-topbar flex items-center px-6 gap-4 shadow-topbar">
      {/* ── Page title ── */}
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-white tracking-tight flex-shrink-0 hidden lg:block">{title}</h2>

      {/* ── Search ── */}
      <div className="flex-1 max-w-md mx-auto lg:mx-0 lg:ml-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:border-gray-600 bg-slate-50 dark:bg-slate-800 dark:bg-gray-800 text-sm text-slate-900 dark:text-slate-100 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            value={searchQuery}
            onChange={e => {
              const val = e.target.value;
              setSearchQuery(val);
              const targetPath = isSearchablePage ? pathname : ROUTES.PROJECTS;
              if (val.trim()) {
                navigate(`${targetPath}?search=${encodeURIComponent(val.trim())}`, { replace: true });
              } else {
                navigate(targetPath, { replace: true });
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* ── Right controls ── */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-gray-700 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-xl shadow-modal border border-slate-200 dark:border-slate-700 dark:border-gray-700 z-50 animate-slide-up">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 dark:border-gray-700">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 dark:text-white">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => navigate(ROUTES.NOTIFICATIONS)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300">
                    View all
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 dark:divide-gray-700">
                {recentNotifs.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No notifications</p>
                ) : recentNotifs.map(n => (
                  <div
                    key={n.id}
                    className={cn(
                      'px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-gray-700/50 cursor-pointer transition-colors',
                      !n.read && 'bg-primary-50 dark:bg-primary-900/20',
                    )}
                    onClick={() => navigate(ROUTES.NOTIFICATIONS)}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary-600 mt-1 flex-shrink-0" />
                      )}
                      <div className={cn(!n.read && 'pl-0', n.read && 'pl-4')}>
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100 dark:text-white line-clamp-1">{n.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-2xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User avatar dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary-700 text-white text-xs font-bold flex items-center justify-center">
              {getInitials(user?.name)}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-xl shadow-modal border border-slate-200 dark:border-slate-700 dark:border-gray-700 z-50 animate-slide-up">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 dark:border-gray-700">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate(ROUTES.SETTINGS); setShowUser(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button
                  onClick={() => { logout(); navigate(ROUTES.LOGIN); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

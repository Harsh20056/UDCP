import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Building2, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { NAVIGATION } from '../../config/navigation.js';
import { ROUTES } from '../../routes/routeConfig.js';
import { getInitials } from '../../utils/formatters.js';
import { cn } from '../../lib/utils.js';

export default function Sidebar({ collapsed = false }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const navItems = NAVIGATION[user?.role] || [];

  // Mock badge counts
  const badgeCounts = {
    conflicts: 5,
    approvals: 18,
    notifications: unreadCount,
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full flex flex-col z-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
      )}
      style={{ backgroundColor: '#0B1929', boxShadow: '2px 0 12px rgba(0,0,0,0.3)' }}
    >
      {/* ── Logo / Brand ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm tracking-wide leading-none">UDCP</p>
            <p className="text-slate-400 text-xs mt-0.5 leading-none">Smart City Hub</p>
          </div>
        )}
      </div>

      {/* ── New Initiative Button ── */}
      {!collapsed && (user?.role === 'admin' || user?.role === 'department_planner') && (
        <div className="px-3 pt-4">
          <NavLink
            to={ROUTES.PROJECTS_NEW}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors duration-150"
          >
            <Plus className="w-4 h-4" />
            New Initiative
          </NavLink>
        </div>
      )}

      {/* ── Navigation Items ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const badgeCount = item.badge ? badgeCounts[item.badge] : null;

          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer select-none group relative',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-400 hover:bg-white dark:bg-slate-900/10 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white dark:bg-slate-900 rounded-r-full" />
                  )}
                  <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-white')} />
                  {!collapsed && (
                    <span className="flex-1 min-w-0 truncate">{item.label}</span>
                  )}
                  {!collapsed && badgeCount > 0 && (
                    <span className={cn(
                      'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-bold',
                      isActive ? 'bg-white dark:bg-slate-900 text-primary-700' : 'bg-red-500 text-white'
                    )}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User Profile ── */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate leading-none">{user?.name}</p>
              <p className="text-slate-400 text-xs truncate mt-0.5 leading-none capitalize">{user?.designation || user?.role?.replace('_', ' ')}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white dark:bg-slate-900/10 transition-colors duration-150"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

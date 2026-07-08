import {
  LayoutDashboard, FolderOpen, Map, AlertTriangle, CheckSquare,
  Bell, BarChart2, ClipboardList, Settings, Users, LogOut,
} from 'lucide-react';
import { ROUTES } from '../routes/routeConfig.js';

// Navigation items per role — drives Sidebar rendering
export const NAVIGATION = {
  admin: [
    { key: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard, path: ROUTES.DASHBOARD,    badge: null },
    { key: 'projects',    label: 'Projects',    icon: FolderOpen,      path: ROUTES.PROJECTS,     badge: null },
    { key: 'map',         label: 'GIS Map',     icon: Map,             path: ROUTES.MAP,          badge: null },
    { key: 'conflicts',   label: 'Conflicts',   icon: AlertTriangle,   path: ROUTES.CONFLICTS,    badge: 'conflicts' },
    { key: 'approvals',   label: 'Approvals',   icon: CheckSquare,     path: ROUTES.APPROVALS,    badge: 'approvals' },
    { key: 'notifications',label: 'Notifications',icon: Bell,          path: ROUTES.NOTIFICATIONS,badge: 'notifications' },
    { key: 'analytics',  label: 'Analytics',   icon: BarChart2,       path: ROUTES.ANALYTICS,    badge: null },
    { key: 'audit-logs', label: 'Audit Logs',  icon: ClipboardList,   path: ROUTES.AUDIT_LOGS,   badge: null },
    { key: 'settings',   label: 'Settings',    icon: Settings,        path: ROUTES.SETTINGS,     badge: null },
  ],
  department_planner: [
    { key: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard, path: ROUTES.DASHBOARD,    badge: null },
    { key: 'projects',    label: 'Projects',    icon: FolderOpen,      path: ROUTES.PROJECTS,     badge: null },
    { key: 'map',         label: 'GIS Map',     icon: Map,             path: ROUTES.MAP,          badge: null },
    { key: 'conflicts',   label: 'Conflicts',   icon: AlertTriangle,   path: ROUTES.CONFLICTS,    badge: 'conflicts' },
    { key: 'notifications',label: 'Notifications',icon: Bell,          path: ROUTES.NOTIFICATIONS,badge: 'notifications' },
    { key: 'analytics',  label: 'Analytics',   icon: BarChart2,       path: ROUTES.ANALYTICS,    badge: null },
    { key: 'settings',   label: 'Settings',    icon: Settings,        path: ROUTES.SETTINGS,     badge: null },
  ],
  approver: [
    { key: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard, path: ROUTES.DASHBOARD,    badge: null },
    { key: 'projects',    label: 'Projects',    icon: FolderOpen,      path: ROUTES.PROJECTS,     badge: null },
    { key: 'map',         label: 'GIS Map',     icon: Map,             path: ROUTES.MAP,          badge: null },
    { key: 'conflicts',   label: 'Conflicts',   icon: AlertTriangle,   path: ROUTES.CONFLICTS,    badge: 'conflicts' },
    { key: 'approvals',   label: 'Approvals',   icon: CheckSquare,     path: ROUTES.APPROVALS,    badge: 'approvals' },
    { key: 'notifications',label: 'Notifications',icon: Bell,          path: ROUTES.NOTIFICATIONS,badge: 'notifications' },
    { key: 'analytics',  label: 'Analytics',   icon: BarChart2,       path: ROUTES.ANALYTICS,    badge: null },
    { key: 'settings',   label: 'Settings',    icon: Settings,        path: ROUTES.SETTINGS,     badge: null },
  ],
  field_engineer: [
    { key: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard, path: ROUTES.DASHBOARD,    badge: null },
    { key: 'projects',    label: 'Projects',    icon: FolderOpen,      path: ROUTES.PROJECTS,     badge: null },
    { key: 'map',         label: 'GIS Map',     icon: Map,             path: ROUTES.MAP,          badge: null },
    { key: 'notifications',label: 'Notifications',icon: Bell,          path: ROUTES.NOTIFICATIONS,badge: 'notifications' },
    { key: 'settings',   label: 'Settings',    icon: Settings,        path: ROUTES.SETTINGS,     badge: null },
  ],
  public_viewer: [],
};

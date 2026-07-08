// Route path constants — used by AppRoutes and navigation
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PENDING_APPROVAL: '/pending-approval',

  DASHBOARD: '/dashboard',

  PROJECTS: '/projects',
  PROJECTS_NEW: '/projects/new',
  PROJECT_DETAILS: (id = ':id') => `/projects/${id}`,
  PROJECT_EDIT: (id = ':id') => `/projects/${id}/edit`,

  MAP: '/map',

  CONFLICTS: '/conflicts',
  CONFLICT_DETAILS: (id = ':id') => `/conflicts/${id}`,

  APPROVALS: '/approvals',

  NOTIFICATIONS: '/notifications',

  ANALYTICS: '/analytics',

  AUDIT_LOGS: '/audit-logs',

  SETTINGS: '/settings',

  CITIZEN: '/citizen',
  CITIZEN_PROJECT: (id = ':id') => `/citizen/projects/${id}`,
  CITIZEN_FEEDBACK: '/citizen/feedback',

  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
};

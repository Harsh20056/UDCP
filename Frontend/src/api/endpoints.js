// All REST API paths defined as constants.
// Mock adapter and real backend must implement exactly these paths.

export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN:          '/auth/login',
  AUTH_REGISTER:       '/auth/register',
  AUTH_FORGOT_PW:      '/auth/forgot-password',
  AUTH_RESET_PW:       '/auth/reset-password',
  AUTH_ME:             '/auth/me',

  // Users (admin)
  USERS_PENDING_STAFF: '/users/pending-staff',
  USER_APPROVE:        (id) => `/users/${id}/approve`,
  USER_REJECT:         (id) => `/users/${id}/reject`,

  // Projects
  PROJECTS:            '/projects',
  PROJECT:             (id) => `/projects/${id}`,
  PROJECT_TIMELINE:    (id) => `/projects/${id}/timeline`,

  // Conflicts
  CONFLICTS:           '/conflicts',
  CONFLICT:            (id) => `/conflicts/${id}`,
  CONFLICT_RESOLVE:    (id) => `/conflicts/${id}/resolve`,

  // Approvals
  APPROVALS:           '/approvals',
  APPROVAL_APPROVE:    (projectId) => `/approvals/${projectId}/approve`,
  APPROVAL_REJECT:     (projectId) => `/approvals/${projectId}/reject`,
  APPROVAL_HISTORY:    (projectId) => `/approvals/${projectId}/history`,

  // Notifications
  NOTIFICATIONS:         '/notifications',
  NOTIFICATION_READ:     (id) => `/notifications/${id}/read`,
  NOTIFICATION_PREFS:    '/notifications/preferences',

  // Analytics
  ANALYTICS_COMPLETION:  '/analytics/completion-rate',
  ANALYTICS_CONFLICT:    '/analytics/conflict-trend',
  ANALYTICS_DEPT_PERF:   '/analytics/department-performance',
  ANALYTICS_BUDGET:      '/analytics/budget-utilization',

  // Audit
  AUDIT_LOGS:            '/audit-logs',

  // Citizen
  CITIZEN_PROJECTS:      '/citizen/projects',
  CITIZEN_FEEDBACK:      '/citizen/feedback',
};

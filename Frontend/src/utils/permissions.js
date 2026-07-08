// Single source of truth for RBAC.
// Every protected route AND every conditionally-rendered button must use can().

import { ROLES } from '../config/constants.js';

// ─── Permission Matrix ────────────────────────────────────────────────────────
// Format: action -> array of roles that CAN perform it
const PERMISSIONS = {
  // Dashboard
  'dashboard:view':              [ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER, ROLES.APPROVER, ROLES.FIELD_ENGINEER],
  'dashboard:view:full':         [ROLES.ADMIN, ROLES.APPROVER],
  'dashboard:view:dept':         [ROLES.DEPARTMENT_PLANNER],
  'dashboard:view:assigned':     [ROLES.FIELD_ENGINEER],

  // Projects
  'project:view':                [ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER, ROLES.APPROVER, ROLES.FIELD_ENGINEER],
  'project:create':              [ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER],
  'project:edit':                [ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER],
  'project:edit:status':         [ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER, ROLES.FIELD_ENGINEER],
  'project:delete':              [ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER],

  // Map
  'map:view':                    [ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER, ROLES.APPROVER, ROLES.FIELD_ENGINEER, ROLES.PUBLIC_VIEWER],
  'map:view:all':                [ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER, ROLES.APPROVER, ROLES.FIELD_ENGINEER],
  'map:view:public':             [ROLES.PUBLIC_VIEWER],

  // Conflicts
  'conflict:view':               [ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER, ROLES.APPROVER, ROLES.FIELD_ENGINEER],
  'conflict:view:all':           [ROLES.ADMIN, ROLES.APPROVER],
  'conflict:resolve':            [ROLES.ADMIN, ROLES.APPROVER],

  // Approvals
  'approval:view':               [ROLES.ADMIN, ROLES.APPROVER],
  'approval:approve':            [ROLES.ADMIN, ROLES.APPROVER],
  'approval:reject':             [ROLES.ADMIN, ROLES.APPROVER],

  // Notifications
  'notification:view':           [ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER, ROLES.APPROVER, ROLES.FIELD_ENGINEER],

  // Analytics
  'analytics:view:full':         [ROLES.ADMIN, ROLES.APPROVER],
  'analytics:view:dept':         [ROLES.DEPARTMENT_PLANNER],

  // Audit Logs
  'audit:view':                  [ROLES.ADMIN],

  // User Management
  'user:manage':                 [ROLES.ADMIN],
  'user:approve':                [ROLES.ADMIN],

  // Settings
  'settings:view':               [ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER, ROLES.APPROVER, ROLES.FIELD_ENGINEER],

  // Citizen
  'citizen:view':                [ROLES.PUBLIC_VIEWER, ROLES.ADMIN, ROLES.DEPARTMENT_PLANNER, ROLES.APPROVER, ROLES.FIELD_ENGINEER],
  'citizen:feedback':            [ROLES.PUBLIC_VIEWER],
};

// ─── can() helper ─────────────────────────────────────────────────────────────
/**
 * Check if a user can perform an action.
 * @param {object} user - The user object with role and department fields.
 * @param {string} action - The action string from the PERMISSIONS matrix.
 * @param {object} [context] - Optional resource context (e.g. { project }).
 * @returns {boolean}
 */
export function can(user, action, context = {}) {
  if (!user) return false;
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  if (!allowed.includes(user.role)) return false;

  // Context-aware checks
  if (action === 'project:edit' && context.project) {
    if (user.role === ROLES.DEPARTMENT_PLANNER) {
      // Planner can only edit their own department's projects, and only before approval
      return (
        context.project.department === user.department &&
        !['APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(context.project.status)
      );
    }
  }

  if (action === 'project:delete' && context.project) {
    if (user.role === ROLES.DEPARTMENT_PLANNER) {
      // Planner can only delete their own dept's draft projects
      return (
        context.project.department === user.department &&
        context.project.status === 'DRAFT'
      );
    }
  }

  return true;
}

/**
 * Check if a user has access to a nav section.
 * Returns an array of the first-level nav items the user can see.
 */
export function getAccessibleRoutes(user) {
  if (!user) return [];
  if (user.role === ROLES.PUBLIC_VIEWER) return ['citizen'];

  const routes = ['dashboard', 'projects', 'map', 'notifications', 'settings'];
  if (can(user, 'conflict:view'))  routes.push('conflicts');
  if (can(user, 'approval:view'))  routes.push('approvals');
  if (can(user, 'analytics:view:full') || can(user, 'analytics:view:dept')) routes.push('analytics');
  if (can(user, 'audit:view'))     routes.push('audit-logs');
  return routes;
}

export { PERMISSIONS };

/**
 * RBAC Permission matrix — direct port of the frontend's permissions.js.
 * Same action strings on both sides so the two systems never drift apart.
 */
const { ROLES } = require('../config/constants');

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

/**
 * Check if a user can perform an action.
 * @param {object} user - { role, department }
 * @param {string} action - action string from the PERMISSIONS matrix
 * @param {object} [context] - optional resource context
 * @returns {boolean}
 */
function can(user, action, context = {}) {
  if (!user) return false;
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  if (!allowed.includes(user.role)) return false;

  // Context-aware checks
  if (action === 'project:edit' && context.project) {
    if (user.role === ROLES.DEPARTMENT_PLANNER) {
      return (
        context.project.department === user.department &&
        !['APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(context.project.status)
      );
    }
  }

  if (action === 'project:delete' && context.project) {
    if (user.role === ROLES.DEPARTMENT_PLANNER) {
      return (
        context.project.department === user.department &&
        context.project.status === 'DRAFT'
      );
    }
  }

  return true;
}

module.exports = { PERMISSIONS, can };

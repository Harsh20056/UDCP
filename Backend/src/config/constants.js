// ─── ROLES ──────────────────────────────────────────────────────────────────
const ROLES = {
  ADMIN: 'admin',
  DEPARTMENT_PLANNER: 'department_planner',
  APPROVER: 'approver',
  FIELD_ENGINEER: 'field_engineer',
  PUBLIC_VIEWER: 'public_viewer',
};

const ROLE_VALUES = Object.values(ROLES);

// ─── ACCOUNT STATUS ──────────────────────────────────────────────────────────
const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  REJECTED: 'REJECTED',
};

const ACCOUNT_STATUS_VALUES = Object.values(ACCOUNT_STATUS);

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
const DEPARTMENTS = {
  PWD: 'PWD',
  WATER: 'Water Supply & Sewerage',
  ELECTRICITY: 'Electricity Board',
  TELECOM: 'Telecom',
  TRAFFIC: 'Traffic Police',
  MUNICIPAL: 'Municipal Corporation',
  GAS: 'Gas Authority',
};

const DEPARTMENT_VALUES = Object.values(DEPARTMENTS);

// ─── PROJECT STATUS ──────────────────────────────────────────────────────────
const PROJECT_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  CONFLICT_ANALYSIS: 'CONFLICT_ANALYSIS',
  DEPT_NOTIFIED: 'DEPT_NOTIFIED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

const PROJECT_STATUS_VALUES = Object.values(PROJECT_STATUS);

// ─── PRIORITY ─────────────────────────────────────────────────────────────────
const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

const PRIORITY_VALUES = Object.values(PRIORITY);

// ─── CONFLICT TYPES ──────────────────────────────────────────────────────────
const CONFLICT_TYPE = {
  LOCATION_OVERLAP: 'LOCATION_OVERLAP',
  TIMELINE_OVERLAP: 'TIMELINE_OVERLAP',
  SAME_ROAD_EXCAVATION: 'SAME_ROAD_EXCAVATION',
  DUPLICATE_REQUEST: 'DUPLICATE_REQUEST',
};

const CONFLICT_TYPE_VALUES = Object.values(CONFLICT_TYPE);

// ─── RISK LEVELS ─────────────────────────────────────────────────────────────
const RISK_LEVEL = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

const RISK_LEVEL_VALUES = Object.values(RISK_LEVEL);

// ─── CONFLICT STATUS ─────────────────────────────────────────────────────────
const CONFLICT_STATUS = {
  OPEN: 'OPEN',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED',
};

const CONFLICT_STATUS_VALUES = Object.values(CONFLICT_STATUS);

// ─── NOTIFICATION TYPES ──────────────────────────────────────────────────────
const NOTIFICATION_TYPE = {
  CONFLICT_DETECTED: 'CONFLICT_DETECTED',
  APPROVAL_GRANTED: 'APPROVAL_GRANTED',
  APPROVAL_REJECTED: 'APPROVAL_REJECTED',
  PROJECT_SUBMITTED: 'PROJECT_SUBMITTED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  SYSTEM: 'SYSTEM',
};

const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPE);

// ─── PROJECT STATE MACHINE ───────────────────────────────────────────────────
const STATUS_TRANSITIONS = {
  DRAFT:             ['SUBMITTED'],
  SUBMITTED:         ['CONFLICT_ANALYSIS'],
  CONFLICT_ANALYSIS: ['DEPT_NOTIFIED', 'REJECTED'],
  DEPT_NOTIFIED:     ['UNDER_REVIEW'],
  UNDER_REVIEW:      ['APPROVED', 'REJECTED'],
  APPROVED:          ['SCHEDULED'],
  SCHEDULED:         ['IN_PROGRESS'],
  IN_PROGRESS:       ['COMPLETED'],
  REJECTED:          ['DRAFT'],
  COMPLETED:         [],
};

// ─── MAP CONFIG ───────────────────────────────────────────────────────────────
const MAP_CONFIG = {
  CONFLICT_RADIUS_M: 150,
};

module.exports = {
  ROLES, ROLE_VALUES,
  ACCOUNT_STATUS, ACCOUNT_STATUS_VALUES,
  DEPARTMENTS, DEPARTMENT_VALUES,
  PROJECT_STATUS, PROJECT_STATUS_VALUES,
  PRIORITY, PRIORITY_VALUES,
  CONFLICT_TYPE, CONFLICT_TYPE_VALUES,
  RISK_LEVEL, RISK_LEVEL_VALUES,
  CONFLICT_STATUS, CONFLICT_STATUS_VALUES,
  NOTIFICATION_TYPE, NOTIFICATION_TYPE_VALUES,
  STATUS_TRANSITIONS,
  MAP_CONFIG,
};

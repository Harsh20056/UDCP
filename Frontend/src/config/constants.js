// ─── ROLES ──────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: 'admin',
  DEPARTMENT_PLANNER: 'department_planner',
  APPROVER: 'approver',
  FIELD_ENGINEER: 'field_engineer',
  PUBLIC_VIEWER: 'public_viewer',
};

export const ROLE_LABELS = {
  admin: 'Administrator',
  department_planner: 'Department Planner',
  approver: 'Approver',
  field_engineer: 'Field Engineer',
  public_viewer: 'Public Viewer',
};

// ─── ACCOUNT STATUS ──────────────────────────────────────────────────────────
export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  REJECTED: 'REJECTED',
};

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
export const DEPARTMENTS = {
  PWD: 'PWD',
  WATER: 'Water Supply & Sewerage',
  ELECTRICITY: 'Electricity Board',
  TELECOM: 'Telecom',
  TRAFFIC: 'Traffic Police',
  MUNICIPAL: 'Municipal Corporation',
  GAS: 'Gas Authority',
};

export const DEPARTMENT_LIST = Object.values(DEPARTMENTS);

// Department short labels for charts
export const DEPARTMENT_SHORT = {
  'PWD': 'PWD',
  'Water Supply & Sewerage': 'WTR',
  'Electricity Board': 'ELEC',
  'Telecom': 'TEL',
  'Traffic Police': 'TRF',
  'Municipal Corporation': 'MUN',
  'Gas Authority': 'GAS',
};

// Department colors — defined once, used everywhere (map markers, tags, charts)
export const DEPARTMENT_COLORS = {
  'PWD':                     { bg: '#1E40AF', text: '#FFFFFF', light: '#DBEAFE', border: '#3B82F6', hex: '#1E40AF' },
  'Water Supply & Sewerage': { bg: '#0891B2', text: '#FFFFFF', light: '#CFFAFE', border: '#06B6D4', hex: '#0891B2' },
  'Electricity Board':       { bg: '#D97706', text: '#FFFFFF', light: '#FEF3C7', border: '#F59E0B', hex: '#D97706' },
  'Telecom':                 { bg: '#7C3AED', text: '#FFFFFF', light: '#EDE9FE', border: '#8B5CF6', hex: '#7C3AED' },
  'Traffic Police':          { bg: '#EA580C', text: '#FFFFFF', light: '#FFEDD5', border: '#F97316', hex: '#EA580C' },
  'Municipal Corporation':   { bg: '#059669', text: '#FFFFFF', light: '#D1FAE5', border: '#10B981', hex: '#059669' },
  'Gas Authority':           { bg: '#BE123C', text: '#FFFFFF', light: '#FFE4E6', border: '#F43F5E', hex: '#BE123C' },
};

// ─── PROJECT STATUS ──────────────────────────────────────────────────────────
export const PROJECT_STATUS = {
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

export const STATUS_CONFIG = {
  DRAFT:             { label: 'Draft',            color: 'slate',  bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
  SUBMITTED:         { label: 'Submitted',         color: 'blue',   bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  CONFLICT_ANALYSIS: { label: 'Conflict Analysis', color: 'amber',  bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  DEPT_NOTIFIED:     { label: 'Dept. Notified',    color: 'cyan',   bg: '#CFFAFE', text: '#164E63', border: '#67E8F9' },
  UNDER_REVIEW:      { label: 'Under Review',      color: 'orange', bg: '#FFEDD5', text: '#9A3412', border: '#FDBA74' },
  APPROVED:          { label: 'Approved',           color: 'green',  bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  REJECTED:          { label: 'Rejected',           color: 'red',    bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  SCHEDULED:         { label: 'Scheduled',          color: 'indigo', bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' },
  IN_PROGRESS:       { label: 'In Progress',        color: 'blue',   bg: '#DBEAFE', text: '#1D4ED8', border: '#60A5FA' },
  COMPLETED:         { label: 'Completed',          color: 'green',  bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
};

// ─── PRIORITY ─────────────────────────────────────────────────────────────────
export const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const PRIORITY_CONFIG = {
  LOW:      { label: 'Low',      bg: '#F0FDF4', text: '#166534', border: '#86EFAC' },
  MEDIUM:   { label: 'Medium',   bg: '#FFFBEB', text: '#92400E', border: '#FCD34D' },
  HIGH:     { label: 'High',     bg: '#FFF7ED', text: '#9A3412', border: '#FDBA74' },
  CRITICAL: { label: 'Critical', bg: '#FFF1F2', text: '#881337', border: '#FDA4AF' },
};

// ─── CONFLICT TYPES ──────────────────────────────────────────────────────────
export const CONFLICT_TYPE = {
  LOCATION_OVERLAP:     'LOCATION_OVERLAP',
  TIMELINE_OVERLAP:     'TIMELINE_OVERLAP',
  SAME_ROAD_EXCAVATION: 'SAME_ROAD_EXCAVATION',
  DUPLICATE_REQUEST:    'DUPLICATE_REQUEST',
};

export const CONFLICT_TYPE_LABELS = {
  LOCATION_OVERLAP:     'Location Overlap',
  TIMELINE_OVERLAP:     'Timeline Overlap',
  SAME_ROAD_EXCAVATION: 'Same-Road Excavation',
  DUPLICATE_REQUEST:    'Duplicate Request',
};

// ─── RISK LEVELS ─────────────────────────────────────────────────────────────
export const RISK_LEVEL = {
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
};

export const RISK_CONFIG = {
  LOW:      { label: 'Low',      color: '#059669', bg: '#D1FAE5', scoreRange: '0–29' },
  MEDIUM:   { label: 'Medium',   color: '#D97706', bg: '#FEF3C7', scoreRange: '30–59' },
  HIGH:     { label: 'High',     color: '#EA580C', bg: '#FFEDD5', scoreRange: '60–84' },
  CRITICAL: { label: 'Critical', color: '#DC2626', bg: '#FEE2E2', scoreRange: '85–100' },
};

// ─── CONFLICT STATUS ─────────────────────────────────────────────────────────
export const CONFLICT_STATUS = {
  OPEN:         'OPEN',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED:     'RESOLVED',
};

// ─── MAP CONFIG ───────────────────────────────────────────────────────────────
// Bhopal, Madhya Pradesh
export const MAP_CONFIG = {
  CENTER: [23.2599, 77.4126],
  ZOOM: 12,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  CONFLICT_RADIUS_M: 150, // metres threshold for location overlap
};

// ─── PROJECT STATE MACHINE ───────────────────────────────────────────────────
export const STATUS_TRANSITIONS = {
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

// ─── NOTIFICATION TYPES ──────────────────────────────────────────────────────
export const NOTIFICATION_TYPE = {
  CONFLICT_DETECTED: 'CONFLICT_DETECTED',
  APPROVAL_GRANTED:  'APPROVAL_GRANTED',
  APPROVAL_REJECTED: 'APPROVAL_REJECTED',
  PROJECT_SUBMITTED: 'PROJECT_SUBMITTED',
  PROJECT_UPDATED:   'PROJECT_UPDATED',
  SYSTEM:            'SYSTEM',
};

import MockAdapter from 'axios-mock-adapter';
import axiosInstance from '../axiosInstance.js';
import { ENV } from '../../config/env.js';
import { MOCK_USERS } from './data/users.js';
import { MOCK_PROJECTS } from './data/projects.js';
import { MOCK_CONFLICTS } from './data/conflicts.js';
import { MOCK_NOTIFICATIONS, MOCK_EMAIL_SMS_LOG } from './data/notifications.js';
import { MOCK_APPROVALS } from './data/approvals.js';
import { MOCK_AUDIT_LOGS } from './data/auditLogs.js';

// In-memory stores (mutable during session)
let users = [...MOCK_USERS];
let projects = [...MOCK_PROJECTS];
let conflicts = [...MOCK_CONFLICTS];
let notifications = [...MOCK_NOTIFICATIONS];
let approvals = [...MOCK_APPROVALS];
let auditLogs = [...MOCK_AUDIT_LOGS];

// Helper — random latency 300–800ms for realism
const delay = () => Math.floor(Math.random() * 500) + 300;

// Helper — paginate an array
function paginate(arr, page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), total: arr.length, page, limit };
}

// Helper — add audit log entry
function addAuditLog(userId, userName, action, resource, resourceId, details) {
  auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId,
    userName,
    action,
    resource,
    resourceId,
    details,
    timestamp: new Date().toISOString(),
  });
}

// Helper — generate a mock JWT token
function mockToken(user) {
  return btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 8 * 3600 * 1000 }));
}

// Helper — get current logged in user from Authorization token
function getCurrentUser(config) {
  const auth = config.headers?.Authorization;
  if (!auth) return null;
  try {
    const payload = JSON.parse(atob(auth.replace('Bearer ', '')));
    return users.find(u => u.id === payload.userId);
  } catch (e) {
    return null;
  }
}

// Helper — Haversine distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper — detect conflicts for a project against all active projects of other departments
function detectConflictsForProject(newProject, allProjects) {
  const newLat = newProject.location?.lat;
  const newLng = newProject.location?.lng;
  const newStart = new Date(newProject.startDate);
  const newEnd = new Date(newProject.endDate);

  if (typeof newLat !== 'number' || typeof newLng !== 'number') return [];

  const foundConflicts = [];

  for (const extProj of allProjects) {
    if (extProj.id === newProject.id) continue;
    if (extProj.department === newProject.department) continue;
    if (extProj.status === 'COMPLETED') continue;

    // Check timeline overlap
    const extStart = new Date(extProj.startDate);
    const extEnd = new Date(extProj.endDate);
    const timelineOverlap = newStart <= extEnd && extStart <= newEnd;
    if (!timelineOverlap) continue;

    // Check proximity
    const extLat = extProj.location?.lat;
    const extLng = extProj.location?.lng;
    if (typeof extLat !== 'number' || typeof extLng !== 'number') continue;

    const dist = getDistance(newLat, newLng, extLat, extLng);
    if (dist < 1.5) {
      foundConflicts.push({
        project: extProj,
        distance: dist,
      });
    }
  }
  return foundConflicts;
}

export function setupMockAdapter() {
  if (!ENV.USE_MOCK) return;

  const mock = new MockAdapter(axiosInstance, { delayResponse: delay() });

  // ─── AUTH ────────────────────────────────────────────────────────────────

  // POST /auth/login
  mock.onPost('/auth/login').reply((config) => {
    const { email, password } = JSON.parse(config.data);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return [401, { message: 'Invalid email or password.' }];

    addAuditLog(user.id, user.name, 'USER_LOGIN', 'auth', null, `${user.name} logged in`);
    const token = mockToken(user);
    const { password: _pw, ...safeUser } = user;
    return [200, { token, user: safeUser }];
  });

  // POST /auth/register
  mock.onPost('/auth/register').reply((config) => {
    const data = JSON.parse(config.data);
    if (users.find(u => u.email === data.email)) {
      return [409, { message: 'Email already registered.' }];
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      department: data.department || null,
      status: data.role === 'public_viewer' ? 'ACTIVE' : 'PENDING_APPROVAL',
      avatar: null,
      designation: data.designation || '',
      phone: data.phone || '',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    const { password: _pw, ...safeUser } = newUser;
    return [201, { user: safeUser }];
  });

  // POST /auth/forgot-password
  mock.onPost('/auth/forgot-password').reply((config) => {
    const { email } = JSON.parse(config.data);
    const user = users.find(u => u.email === email);
    if (!user) return [404, { message: 'Email not found.' }];
    return [200, { message: 'OTP sent to your registered email (simulated).' }];
  });

  // POST /auth/reset-password
  mock.onPost('/auth/reset-password').reply(() => {
    return [200, { message: 'Password reset successful (simulated).' }];
  });

  // GET /auth/me
  mock.onGet('/auth/me').reply((config) => {
    const auth = config.headers?.Authorization;
    if (!auth) return [401, { message: 'Unauthorized' }];
    try {
      const payload = JSON.parse(atob(auth.replace('Bearer ', '')));
      const user = users.find(u => u.id === payload.userId);
      if (!user) return [404, { message: 'User not found' }];
      const { password: _pw, ...safeUser } = user;
      return [200, safeUser];
    } catch {
      return [401, { message: 'Invalid token' }];
    }
  });

  // ─── USERS (Admin) ───────────────────────────────────────────────────────

  // GET /users/pending-staff
  mock.onGet('/users/pending-staff').reply(() => {
    const pending = users.filter(u => u.status === 'PENDING_APPROVAL').map(({ password: _pw, ...u }) => u);
    return [200, pending];
  });

  // POST /users/:id/approve
  mock.onPost(/\/users\/[\w-]+\/approve/).reply((config) => {
    const id = config.url.split('/')[2];
    const user = users.find(u => u.id === id);
    if (!user) return [404, { message: 'User not found' }];
    user.status = 'ACTIVE';
    addAuditLog('usr-001', 'Admin', 'USER_APPROVED', 'user', id, `Approved staff account for ${user.name}`);
    const { password: _pw, ...safeUser } = user;
    return [200, safeUser];
  });

  // POST /users/:id/reject
  mock.onPost(/\/users\/[\w-]+\/reject/).reply((config) => {
    const id = config.url.split('/')[2];
    const user = users.find(u => u.id === id);
    if (!user) return [404, { message: 'User not found' }];
    user.status = 'REJECTED';
    addAuditLog('usr-001', 'Admin', 'USER_REJECTED', 'user', id, `Rejected staff account for ${user.name}`);
    const { password: _pw, ...safeUser } = user;
    return [200, safeUser];
  });

  // ─── PROJECTS ────────────────────────────────────────────────────────────

  // GET /projects
  mock.onGet('/projects').reply((config) => {
    let filtered = [...projects];
    const params = config.params || {};

    const currentUser = getCurrentUser(config);
    if (currentUser && currentUser.department && currentUser.role !== 'admin' && currentUser.role !== 'approver') {
      // Find all active conflicts involving this department
      const deptConflicts = conflicts.filter(c => c.departmentsInvolved.includes(currentUser.department) && c.status !== 'RESOLVED');
      const conflictingProjectIds = new Set();
      deptConflicts.forEach(c => {
        c.involvedProjectIds.forEach(pid => conflictingProjectIds.add(pid));
      });
      
      // Filter projects to only return the user's department's projects OR projects involved in a conflict with them
      filtered = filtered.filter(p => p.department === currentUser.department || conflictingProjectIds.has(p.id));
    }

    if (params.department) filtered = filtered.filter(p => p.department === params.department);
    if (params.status)     filtered = filtered.filter(p => p.status === params.status);
    if (params.priority)   filtered = filtered.filter(p => p.priority === params.priority);
    if (params.search)     filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(params.search.toLowerCase()) ||
      p.id.toLowerCase().includes(params.search.toLowerCase())
    );
    // Sort by updatedAt desc
    filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return [200, paginate(filtered, params.page, params.limit || 20)];
  });

  // POST /projects
  mock.onPost('/projects').reply((config) => {
    const data = JSON.parse(config.data);
    const currentUser = getCurrentUser(config);
    const userId = currentUser ? currentUser.id : 'usr-002'; // default fallback
    const userName = currentUser ? currentUser.name : 'Planner';
    const userDept = currentUser ? currentUser.department : (data.department || 'PWD');

    const newProject = {
      id: `PRJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, '0')}`,
      ...data,
      department: userDept,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conflictIds: [],
      progressPercent: 0,
    };

    // Detect conflicts against other projects!
    const conflictingProjects = detectConflictsForProject(newProject, projects);
    if (conflictingProjects.length > 0) {
      conflictingProjects.forEach(cProjInfo => {
        const extProj = cProjInfo.project;
        const newConflictId = `CON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const newConflict = {
          id: newConflictId,
          involvedProjectIds: [newProject.id, extProj.id],
          conflictType: 'SAME_ROAD_EXCAVATION', // default type
          conflictScore: Math.floor(Math.random() * 30) + 65, // high risk score
          riskLevel: 'HIGH',
          departmentsInvolved: [newProject.department, extProj.department],
          suggestedActions: [
            `Coordinate timeline overlap between ${newProject.name} (${newProject.department}) and ${extProj.name} (${extProj.department}).`,
            `Perform joint site inspection to minimize repeated road excavation.`,
            `Align excavation schedules to avoid disrupting newly constructed components.`
          ],
          status: 'OPEN',
          detectedAt: new Date().toISOString(),
          locationDescription: `${newProject.location.address || 'Shared area'} — Proximity overlap (${cProjInfo.distance.toFixed(2)} km)`,
          roadName: newProject.location.roadName || extProj.location.roadName || 'Multiple Roads',
        };
        
        conflicts.push(newConflict);
        
        // Link conflict IDs to both projects
        if (!newProject.conflictIds) newProject.conflictIds = [];
        newProject.conflictIds.push(newConflictId);
        
        if (!extProj.conflictIds) extProj.conflictIds = [];
        extProj.conflictIds.push(newConflictId);
        
        // Create notifications for both departments!
        const notifMsg = `Conflict detected: Proximity overlap between ${newProject.name} (${newProject.department}) and ${extProj.name} (${extProj.department}) near ${newProject.location.address || 'project site'}.`;
        
        notifications.unshift({
          id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: 'CONFLICT_DETECTED',
          title: `Conflict Detected: ${newProject.name} / ${extProj.name}`,
          message: notifMsg,
          projectId: newProject.id,
          conflictId: newConflictId,
          read: false,
          recipientRoles: ['admin', 'approver', 'department_planner', 'field_engineer'],
          recipientDepartments: [newProject.department, extProj.department],
          createdAt: new Date().toISOString(),
        });
      });
    }

    projects.unshift(newProject);
    
    addAuditLog(userId, userName, 'PROJECT_CREATED', 'project', newProject.id, `Created project: ${newProject.name}`);

    // Add standard notification
    notifications.unshift({
      id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'PROJECT_SUBMITTED',
      title: `New Project: ${newProject.name}`,
      message: `A new project has been registered by ${newProject.department}.`,
      projectId: newProject.id,
      conflictId: null,
      read: false,
      recipientRoles: ['admin', 'approver'],
      recipientDepartments: [newProject.department],
      createdAt: new Date().toISOString(),
    });

    return [201, newProject];
  });

  // GET /projects/:id
  mock.onGet(/\/projects\/PRJ-[\w-]+$/).reply((config) => {
    const id = config.url.split('/').pop();
    const project = projects.find(p => p.id === id);
    if (!project) return [404, { message: 'Project not found' }];
    return [200, project];
  });

  // PUT /projects/:id
  mock.onPut(/\/projects\/PRJ-[\w-]+$/).reply((config) => {
    const id = config.url.split('/').pop();
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return [404, { message: 'Project not found' }];
    const updated = { ...projects[idx], ...JSON.parse(config.data), updatedAt: new Date().toISOString() };
    projects[idx] = updated;
    addAuditLog('usr-001', 'User', 'PROJECT_UPDATED', 'project', id, `Updated project: ${updated.name}`);
    return [200, updated];
  });

  // DELETE /projects/:id
  mock.onDelete(/\/projects\/PRJ-[\w-]+$/).reply((config) => {
    const id = config.url.split('/').pop();
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return [404, { message: 'Project not found' }];
    const [deleted] = projects.splice(idx, 1);
    addAuditLog('usr-001', 'User', 'PROJECT_DELETED', 'project', id, `Deleted project: ${deleted.name}`);
    return [200, { message: 'Project deleted.' }];
  });

  // GET /projects/:id/timeline
  mock.onGet(/\/projects\/PRJ-[\w-]+\/timeline/).reply((config) => {
    const id = config.url.split('/')[2];
    const project = projects.find(p => p.id === id);
    if (!project) return [404, { message: 'Project not found' }];
    const approval = approvals.find(a => a.projectId === id);
    return [200, approval?.history || []];
  });

  // ─── CONFLICTS ──────────────────────────────────────────────────────────

  // GET /conflicts
  mock.onGet('/conflicts').reply((config) => {
    let filtered = [...conflicts];
    const params = config.params || {};

    const currentUser = getCurrentUser(config);
    if (currentUser && currentUser.department && currentUser.role !== 'admin' && currentUser.role !== 'approver') {
      filtered = filtered.filter(c => c.departmentsInvolved.includes(currentUser.department));
    }

    if (params.riskLevel)   filtered = filtered.filter(c => c.riskLevel === params.riskLevel);
    if (params.department)  filtered = filtered.filter(c => c.departmentsInvolved.includes(params.department));
    if (params.status)      filtered = filtered.filter(c => c.status === params.status);
    return [200, { data: filtered, total: filtered.length }];
  });

  // GET /conflicts/:id
  mock.onGet(/\/conflicts\/CON-[\w-]+$/).reply((config) => {
    const id = config.url.split('/').pop();
    const conflict = conflicts.find(c => c.id === id);
    if (!conflict) return [404, { message: 'Conflict not found' }];
    // Hydrate with project names
    const involvedProjects = conflict.involvedProjectIds.map(pid => projects.find(p => p.id === pid)).filter(Boolean);
    return [200, { ...conflict, involvedProjects }];
  });

  // POST /conflicts/:id/resolve
  mock.onPost(/\/conflicts\/CON-[\w-]+\/resolve/).reply((config) => {
    const id = config.url.split('/')[2];
    const idx = conflicts.findIndex(c => c.id === id);
    if (idx === -1) return [404, { message: 'Conflict not found' }];
    conflicts[idx].status = 'RESOLVED';
    addAuditLog('usr-001', 'User', 'CONFLICT_RESOLVED', 'conflict', id, `Resolved conflict ${id}`);
    return [200, conflicts[idx]];
  });

  // ─── APPROVALS ──────────────────────────────────────────────────────────

  // GET /approvals
  mock.onGet('/approvals').reply((config) => {
    let filtered = [...approvals];
    const params = config.params || {};
    if (params.status) filtered = filtered.filter(a => a.status.toLowerCase() === params.status.toLowerCase());
    return [200, { data: filtered, total: filtered.length }];
  });

  // POST /approvals/:projectId/approve
  mock.onPost(/\/approvals\/PRJ-[\w-]+\/approve/).reply((config) => {
    const projectId = config.url.split('/')[2];
    const { comment, reviewedBy } = JSON.parse(config.data || '{}');
    const approval = approvals.find(a => a.projectId === projectId);
    const project = projects.find(p => p.id === projectId);
    if (!approval || !project) return [404, { message: 'Not found' }];
    approval.status = 'APPROVED';
    approval.currentStage = 'APPROVED';
    approval.comment = comment;
    approval.reviewedBy = reviewedBy;
    approval.reviewedAt = new Date().toISOString();
    approval.history.push({ stage: 'APPROVED', actor: 'Approver', action: 'Approved', timestamp: new Date().toISOString(), comment });
    project.status = 'APPROVED';
    project.updatedAt = new Date().toISOString();
    addAuditLog('usr-003', 'Anil Kumar', 'PROJECT_APPROVED', 'project', projectId, `Approved ${project.name}`);
    notifications.unshift({ id: `NOT-${Date.now()}`, type: 'APPROVAL_GRANTED', title: `Approved: ${project.name}`, message: `Project ${projectId} has been approved.`, projectId, conflictId: null, read: false, recipientRoles: ['admin', 'department_planner'], createdAt: new Date().toISOString() });
    return [200, approval];
  });

  // POST /approvals/:projectId/reject
  mock.onPost(/\/approvals\/PRJ-[\w-]+\/reject/).reply((config) => {
    const projectId = config.url.split('/')[2];
    const { comment } = JSON.parse(config.data || '{}');
    const approval = approvals.find(a => a.projectId === projectId);
    const project = projects.find(p => p.id === projectId);
    if (!approval || !project) return [404, { message: 'Not found' }];
    approval.status = 'REJECTED';
    approval.currentStage = 'REJECTED';
    approval.comment = comment;
    approval.history.push({ stage: 'REJECTED', actor: 'Approver', action: 'Rejected', timestamp: new Date().toISOString(), comment });
    project.status = 'REJECTED';
    project.updatedAt = new Date().toISOString();
    addAuditLog('usr-003', 'Anil Kumar', 'PROJECT_REJECTED', 'project', projectId, `Rejected ${project.name}: ${comment}`);
    return [200, approval];
  });

  // GET /approvals/:projectId/history
  mock.onGet(/\/approvals\/PRJ-[\w-]+\/history/).reply((config) => {
    const projectId = config.url.split('/')[2];
    const approval = approvals.find(a => a.projectId === projectId);
    return [200, approval?.history || []];
  });

  // ─── NOTIFICATIONS ──────────────────────────────────────────────────────

  // GET /notifications
  mock.onGet('/notifications').reply((config) => {
    let filtered = [...notifications];

    const currentUser = getCurrentUser(config);
    if (currentUser && currentUser.department && currentUser.role !== 'admin' && currentUser.role !== 'approver') {
      filtered = filtered.filter(n => 
        !n.recipientDepartments || 
        n.recipientDepartments.includes(currentUser.department)
      );
    }

    return [200, { data: filtered, total: filtered.length, unread: filtered.filter(n => !n.read).length }];
  });

  // POST /notifications/:id/read
  mock.onPost(/\/notifications\/NOT-[\w-]+\/read/).reply((config) => {
    const id = config.url.split('/')[2];
    const n = notifications.find(n => n.id === id);
    if (n) n.read = true;
    return [200, { message: 'Marked as read.' }];
  });

  // GET /notifications/preferences
  mock.onGet('/notifications/preferences').reply(() => {
    return [200, {
      email: true,
      sms: false,
      inApp: true,
      conflictAlerts: true,
      approvalUpdates: true,
      projectUpdates: true,
    }];
  });

  // PUT /notifications/preferences
  mock.onPut('/notifications/preferences').reply((config) => {
    return [200, JSON.parse(config.data)];
  });

  // ─── ANALYTICS ──────────────────────────────────────────────────────────

  mock.onGet('/analytics/completion-rate').reply(() => {
    return [200, {
      overall: 68,
      trend: [
        { month: 'Jan', rate: 52 }, { month: 'Feb', rate: 55 }, { month: 'Mar', rate: 58 },
        { month: 'Apr', rate: 61 }, { month: 'May', rate: 63 }, { month: 'Jun', rate: 65 },
        { month: 'Jul', rate: 68 },
      ],
      byDepartment: [
        { dept: 'PWD', rate: 72 }, { dept: 'Water', rate: 65 }, { dept: 'Electricity', rate: 60 },
        { dept: 'Telecom', rate: 55 }, { dept: 'Traffic', rate: 80 }, { dept: 'Municipal', rate: 70 },
        { dept: 'Gas', rate: 50 },
      ],
    }];
  });

  mock.onGet('/analytics/conflict-trend').reply(() => {
    return [200, {
      trend: [
        { month: 'Jan', conflicts: 8, resolved: 5 }, { month: 'Feb', conflicts: 11, resolved: 7 },
        { month: 'Mar', conflicts: 9, resolved: 8 }, { month: 'Apr', conflicts: 14, resolved: 10 },
        { month: 'May', conflicts: 7, resolved: 6 }, { month: 'Jun', conflicts: 6, resolved: 4 },
        { month: 'Jul', conflicts: 5, resolved: 1 },
      ],
    }];
  });

  mock.onGet('/analytics/department-performance').reply(() => {
    return [200, {
      departments: [
        { dept: 'PWD', projects: 6, completed: 2, inProgress: 3, conflictRate: 35 },
        { dept: 'Water', projects: 4, completed: 2, inProgress: 2, conflictRate: 20 },
        { dept: 'Electricity', projects: 2, completed: 0, inProgress: 1, conflictRate: 45 },
        { dept: 'Telecom', projects: 2, completed: 0, inProgress: 1, conflictRate: 30 },
        { dept: 'Traffic', projects: 2, completed: 1, inProgress: 0, conflictRate: 15 },
        { dept: 'Municipal', projects: 3, completed: 1, inProgress: 1, conflictRate: 10 },
        { dept: 'Gas', projects: 2, completed: 0, inProgress: 1, conflictRate: 40 },
      ],
    }];
  });

  mock.onGet('/analytics/budget-utilization').reply(() => {
    return [200, {
      totalBudget: 452500000,
      totalUtilized: 127090000,
      utilizationPercent: 28,
      byDepartment: [
        { dept: 'PWD', budget: 103700000, utilized: 30500000 },
        { dept: 'Water', budget: 185500000, utilized: 46800000 },
        { dept: 'Electricity', budget: 133000000, utilized: 11000000 },
        { dept: 'Telecom', budget: 27500000, utilized: 9000000 },
        { dept: 'Traffic', budget: 20200000, utilized: 15240000 },
        { dept: 'Municipal', budget: 41300000, utilized: 16600000 },
        { dept: 'Gas', budget: 62000000, utilized: 7600000 },
      ],
    }];
  });

  // ─── AUDIT LOGS ─────────────────────────────────────────────────────────

  mock.onGet('/audit-logs').reply((config) => {
    let filtered = [...auditLogs];
    const params = config.params || {};
    if (params.user)   filtered = filtered.filter(l => l.userId === params.user || l.userName.toLowerCase().includes(params.user.toLowerCase()));
    if (params.action) filtered = filtered.filter(l => l.action === params.action);
    if (params.dateFrom) filtered = filtered.filter(l => new Date(l.timestamp) >= new Date(params.dateFrom));
    if (params.dateTo)   filtered = filtered.filter(l => new Date(l.timestamp) <= new Date(params.dateTo));
    return [200, paginate(filtered, params.page, params.limit || 25)];
  });

  // ─── CITIZEN ─────────────────────────────────────────────────────────────

  mock.onGet('/citizen/projects').reply((config) => {
    const params = config.params || {};
    let publicProjects = projects.filter(p =>
      ['IN_PROGRESS', 'SCHEDULED', 'APPROVED', 'COMPLETED'].includes(p.status)
    );
    if (params.search) {
      publicProjects = publicProjects.filter(p =>
        p.name.toLowerCase().includes(params.search.toLowerCase()) ||
        p.location.address.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    return [200, { data: publicProjects, total: publicProjects.length }];
  });

  mock.onPost('/citizen/feedback').reply(() => {
    return [201, { message: 'Feedback submitted successfully. Thank you!' }];
  });

  // ─── Simulated email/SMS log ─────────────────────────────────────────────
  mock.onGet('/notifications/email-sms-log').reply(() => {
    return [200, MOCK_EMAIL_SMS_LOG];
  });

  console.log('[UDCP Mock] Mock adapter initialized. All endpoints mocked.');
}

// Export stores for direct access in context providers (for simulated push)
export { notifications, projects, conflicts };

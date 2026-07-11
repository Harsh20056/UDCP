const { Op, Sequelize } = require('sequelize');
const { Project, Conflict, User, ProjectTimeline, sequelize } = require('../models');
const { makePoint } = require('../utils/geo');

/**
 * Format a project row for API response — matches the frontend mock shape exactly.
 */
function formatProject(row) {
  const p = row.toJSON ? row.toJSON() : { ...row };
  
  // Parse location geometry to { lat, lng, address, roadName }
  if (p.location_geojson) {
    try {
      const geoj = typeof p.location_geojson === 'string' ? JSON.parse(p.location_geojson) : p.location_geojson;
      p.location = {
        lat: geoj.coordinates[1],
        lng: geoj.coordinates[0],
        address: p.address || '',
        roadName: p.road_name || '',
      };
    } catch (e) {
      p.location = { lat: 0, lng: 0, address: p.address || '', roadName: p.road_name || '' };
    }
  } else {
    p.location = { lat: 0, lng: 0, address: p.address || '', roadName: p.road_name || '' };
  }

  // Map snake_case DB fields to camelCase frontend fields
  return {
    id: p.id,
    name: p.name,
    department: p.department,
    description: p.description,
    budget: parseFloat(p.budget) || 0,
    budgetUtilized: parseFloat(p.budget_utilized) || 0,
    startDate: p.start_date,
    endDate: p.end_date,
    status: p.status,
    priority: p.priority,
    location: p.location,
    assignedOfficer: p.assigned_officer || '',
    createdBy: p.created_by_id,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    conflictIds: p.conflictIds || [],
    progressPercent: p.progress_percent || 0,
  };
}

/**
 * Raw SQL query helper that selects projects with ST_AsGeoJSON for the geometry column.
 */
const PROJECT_SELECT = `
  p.id, p.name, p.department, p.description, p.budget, p.budget_utilized,
  p.start_date, p.end_date, p.status, p.priority, p.address, p.road_name,
  p.progress_percent, p.assigned_officer, p.assigned_officer_id, p.created_by_id,
  p.created_at, p.updated_at,
  ST_AsGeoJSON(p.location) as location_geojson
`;

/**
 * List projects with filters, search, and pagination.
 */
async function listProjects(query, currentUser) {
  const { department, status, priority, search, page = 1, limit = 20 } = query;
  const conditions = [];
  const replacements = {};

  if (currentUser && currentUser.department && currentUser.role !== 'admin' && currentUser.role !== 'approver') {
    conditions.push(`(
      p.department = :userDepartment 
      OR p.id IN (
        SELECT pc.project_id 
        FROM project_conflicts pc 
        JOIN conflicts c ON c.id = pc.conflict_id 
        WHERE c.status != 'RESOLVED' 
          AND c.departments_involved @> :userDeptJson::jsonb
      )
    )`);
    replacements.userDepartment = currentUser.department;
    replacements.userDeptJson = JSON.stringify([currentUser.department]);
  } else if (department) {
    conditions.push('p.department = :department');
    replacements.department = department;
  }
  if (status) {
    conditions.push('p.status = :status');
    replacements.status = status;
  }
  if (priority) {
    conditions.push('p.priority = :priority');
    replacements.priority = priority;
  }
  if (search) {
    conditions.push('(p.name ILIKE :search OR p.id::text ILIKE :search)');
    replacements.search = `%${search}%`;
  }

  const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

  const countResult = await sequelize.query(
    `SELECT COUNT(*) as total FROM projects p ${whereClause}`,
    { replacements, type: Sequelize.QueryTypes.SELECT }
  );
  const total = parseInt(countResult[0].total);

  const rows = await sequelize.query(
    `SELECT ${PROJECT_SELECT} FROM projects p ${whereClause} ORDER BY p.updated_at DESC LIMIT :limit OFFSET :offset`,
    { replacements: { ...replacements, limit: parseInt(limit), offset }, type: Sequelize.QueryTypes.SELECT }
  );

  // Get conflict IDs for each project
  const projectIds = rows.map(r => r.id);
  let conflictMap = {};
  if (projectIds.length > 0) {
    const conflictRows = await sequelize.query(
      `SELECT pc.project_id, c.id as conflict_id FROM project_conflicts pc JOIN conflicts c ON c.id = pc.conflict_id WHERE pc.project_id IN (:projectIds)`,
      { replacements: { projectIds }, type: Sequelize.QueryTypes.SELECT }
    );
    for (const cr of conflictRows) {
      if (!conflictMap[cr.project_id]) conflictMap[cr.project_id] = [];
      conflictMap[cr.project_id].push(cr.conflict_id);
    }
  }

  const data = rows.map(r => {
    r.conflictIds = conflictMap[r.id] || [];
    return formatProject(r);
  });

  return { data, total, page: parseInt(page), limit: parseInt(limit) };
}

/**
 * Get a single project by ID.
 */
async function getProjectById(id) {
  const rows = await sequelize.query(
    `SELECT ${PROJECT_SELECT} FROM projects p WHERE p.id = :id`,
    { replacements: { id }, type: Sequelize.QueryTypes.SELECT }
  );

  if (!rows.length) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }

  // Get conflict IDs
  const conflictRows = await sequelize.query(
    `SELECT c.id as conflict_id FROM project_conflicts pc JOIN conflicts c ON c.id = pc.conflict_id WHERE pc.project_id = :id`,
    { replacements: { id }, type: Sequelize.QueryTypes.SELECT }
  );
  rows[0].conflictIds = conflictRows.map(cr => cr.conflict_id);

  return formatProject(rows[0]);
}

/**
 * Create a new project.
 */
async function createProject(data, userId) {
  const { lat, lng, address, roadName } = data.location || {};

  // Use a transaction to ensure all related records are created atomically
  return sequelize.transaction(async (transaction) => {
    const result = await sequelize.query(`
      INSERT INTO projects (id, name, department, description, budget, budget_utilized, start_date, end_date, status, priority, address, road_name, progress_percent, assigned_officer, created_by_id, location, created_at, updated_at)
      VALUES (gen_random_uuid(), :name, :department, :description, :budget, 0, :startDate, :endDate, :status, :priority, :address, :roadName, 0, :assignedOfficer, :createdById, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), NOW(), NOW())
      RETURNING id
    `, {
      replacements: {
        name: data.name,
        department: data.department,
        description: data.description || '',
        budget: data.budget || 0,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status || 'DRAFT',
        priority: data.priority || 'MEDIUM',
        address: address || '',
        roadName: roadName || '',
        assignedOfficer: data.assignedOfficer || '',
        createdById: userId,
        lng: parseFloat(lng) || 0,
        lat: parseFloat(lat) || 0,
      },
      type: Sequelize.QueryTypes.INSERT,
      transaction,
    });

    const newId = result[0][0].id;
    const status = data.status || 'DRAFT';

    // Import necessary models and services
    const { ProjectTimeline, Approval, Notification } = require('../models');
    const notificationService = require('./notification.service');
    const conflictDetectionService = require('./conflictDetection.service');

    // Get user info for timeline
    const User = require('../models').User;
    const user = await User.findByPk(userId, { transaction });
    const actorName = user ? user.name : 'Unknown User';

    // 1. Create initial timeline entry
    await ProjectTimeline.create({
      project_id: newId,
      stage: status,
      actor: actorName,
      action: 'Project created',
      comment: null,
      changed_by_id: userId,
    }, { transaction });

    // 2. If status is SUBMITTED or beyond, create approval record
    const submittableStatuses = ['SUBMITTED', 'CONFLICT_ANALYSIS', 'DEPT_NOTIFIED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
    if (submittableStatuses.includes(status)) {
      await Approval.create({
        project_id: newId,
        status: status === 'APPROVED' ? 'APPROVED' : (status === 'REJECTED' ? 'REJECTED' : 'PENDING'),
        submitted_by: userId,
        submitted_at: new Date(),
      }, { transaction });
    }

    // 3. Create notification for project submission
    if (status === 'SUBMITTED' || submittableStatuses.includes(status)) {
      await Notification.create({
        type: 'PROJECT_SUBMITTED',
        title: `New Project Registered: ${data.name}`,
        message: `A new project "${data.name}" has been submitted for review by ${data.department}.`,
        related_project_id: newId,
        recipient_roles: ['admin', 'approver'],
        is_read: false,
      }, { transaction });
    }

    // 4. Run conflict detection if project has location coordinates
    if (lat && lng) {
      try {
        const conflicts = await conflictDetectionService.detectConflicts(newId);
        if (conflicts.length > 0) {
          await conflictDetectionService.saveConflicts(conflicts, transaction);
          
          // Create conflict notification
          for (const conflict of conflicts) {
            await Notification.create({
              type: 'CONFLICT_DETECTED',
              title: `Conflict Detected: ${data.name}`,
              message: `Project "${data.name}" has a ${conflict.riskLevel} risk conflict. Conflict score: ${conflict.conflictScore}/100.`,
              related_project_id: newId,
              related_conflict_id: conflict.id,
              recipient_roles: ['admin', 'approver', 'department_planner'],
              recipient_departments: conflict.departmentsInvolved || [],
              is_read: false,
            }, { transaction });
          }
        }
      } catch (err) {
        console.error('Conflict detection error (non-fatal):', err.message);
      }
    }

    // Transaction will commit here, then we can read the project
    return newId;
  }).then(async (projectId) => {
    // After transaction commits, fetch and return the complete project
    return getProjectById(projectId);
  });
}

/**
 * Update a project.
 */
async function updateProject(id, data) {
  // First check it exists
  const existing = await getProjectById(id);

  const updates = [];
  const replacements = { id };

  if (data.name !== undefined) { updates.push('name = :name'); replacements.name = data.name; }
  if (data.department !== undefined) { updates.push('department = :department'); replacements.department = data.department; }
  if (data.description !== undefined) { updates.push('description = :description'); replacements.description = data.description; }
  if (data.budget !== undefined) { updates.push('budget = :budget'); replacements.budget = data.budget; }
  if (data.budgetUtilized !== undefined) { updates.push('budget_utilized = :budgetUtilized'); replacements.budgetUtilized = data.budgetUtilized; }
  if (data.startDate !== undefined) { updates.push('start_date = :startDate'); replacements.startDate = data.startDate; }
  if (data.endDate !== undefined) { updates.push('end_date = :endDate'); replacements.endDate = data.endDate; }
  if (data.status !== undefined) { updates.push('status = :status'); replacements.status = data.status; }
  if (data.priority !== undefined) { updates.push('priority = :priority'); replacements.priority = data.priority; }
  if (data.assignedOfficer !== undefined) { updates.push('assigned_officer = :assignedOfficer'); replacements.assignedOfficer = data.assignedOfficer; }
  if (data.progressPercent !== undefined) { updates.push('progress_percent = :progressPercent'); replacements.progressPercent = data.progressPercent; }

  if (data.location) {
    const { lat, lng, address, roadName } = data.location;
    if (lat !== undefined && lng !== undefined) {
      updates.push('location = ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)');
      replacements.lat = parseFloat(lat);
      replacements.lng = parseFloat(lng);
    }
    if (address !== undefined) { updates.push('address = :address'); replacements.address = address; }
    if (roadName !== undefined) { updates.push('road_name = :roadName'); replacements.roadName = roadName; }
  }

  updates.push('updated_at = NOW()');

  if (updates.length > 1) {
    await sequelize.query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = :id`,
      { replacements }
    );
  }

  return getProjectById(id);
}

/**
 * Delete a project.
 */
async function deleteProject(id) {
  const existing = await getProjectById(id);
  await sequelize.query('DELETE FROM projects WHERE id = :id', { replacements: { id } });
  return { message: 'Project deleted.' };
}

/**
 * Get project timeline (approval/status history).
 */
async function getProjectTimeline(projectId) {
  const entries = await ProjectTimeline.findAll({
    where: { project_id: projectId },
    order: [['created_at', 'ASC']],
    raw: true,
  });

  return entries.map(e => ({
    stage: e.stage,
    actor: e.actor,
    action: e.action,
    timestamp: e.created_at,
    comment: e.comment,
  }));
}

module.exports = { listProjects, getProjectById, createProject, updateProject, deleteProject, getProjectTimeline, formatProject, PROJECT_SELECT };

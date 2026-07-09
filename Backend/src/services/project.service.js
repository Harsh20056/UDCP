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
async function listProjects(query) {
  const { department, status, priority, search, page = 1, limit = 20 } = query;
  const conditions = [];
  const replacements = {};

  if (department) {
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
  });

  const newId = result[0][0].id;
  return getProjectById(newId);
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

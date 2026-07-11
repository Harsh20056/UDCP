const projectService = require('../services/project.service');
const { AuditLog } = require('../models');

async function list(req, res, next) {
  try {
    const result = await projectService.listProjects(req.query, req.user);
    // Match mock: returns { data: [...], total, page, limit }
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    return res.json(project);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ message: err.message });
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const project = await projectService.createProject(req.body, req.user.id);

    // Audit log
    await AuditLog.create({
      user_id: req.user.id,
      action: 'PROJECT_CREATED',
      target_type: 'project',
      target_id: project.id,
      details: `Created project: ${project.name}`,
    });

    return res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);

    await AuditLog.create({
      user_id: req.user.id,
      action: 'PROJECT_UPDATED',
      target_type: 'project',
      target_id: project.id,
      details: `Updated project: ${project.name}`,
    });

    return res.json(project);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ message: err.message });
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    // Capture name for audit before deletion
    const project = await projectService.getProjectById(req.params.id);

    const result = await projectService.deleteProject(req.params.id);

    await AuditLog.create({
      user_id: req.user.id,
      action: 'PROJECT_DELETED',
      target_type: 'project',
      target_id: req.params.id,
      details: `Deleted project: ${project.name}`,
    });

    return res.json(result);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ message: err.message });
    next(err);
  }
}

async function getTimeline(req, res, next) {
  try {
    const timeline = await projectService.getProjectTimeline(req.params.id);
    // Match mock: returns array directly
    return res.json(timeline);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, getTimeline };

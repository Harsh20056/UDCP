const { Approval, Project, ProjectTimeline, AuditLog } = require('../models');
const { transitionStatus } = require('../services/workflow.service');

async function list(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status.toUpperCase();

    const approvals = await Approval.findAll({
      where,
      include: [{
        model: Project,
        attributes: ['id', 'name', 'department', 'priority', 'status'],
      }],
      order: [['created_at', 'DESC']],
    });

    // Format to match frontend mock shape
    const data = approvals.map(a => {
      const aj = a.toJSON();
      return {
        id: aj.id,
        projectId: aj.project_id,
        projectName: aj.Project ? aj.Project.name : '',
        department: aj.Project ? aj.Project.department : '',
        status: aj.status,
        priority: aj.Project ? aj.Project.priority : '',
        submittedBy: aj.submitted_by,
        submittedAt: aj.submitted_at,
        reviewedBy: aj.reviewed_by,
        reviewedAt: aj.reviewed_at,
        comment: aj.comment,
        currentStage: aj.Project ? aj.Project.status : '',
      };
    });

    return res.json({ data, total: data.length });
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const { projectId } = req.params;
    const { comment } = req.body || {};

    const approval = await Approval.findOne({ where: { project_id: projectId } });
    if (!approval) {
      // Create approval if it doesn't exist
      return res.status(404).json({ message: 'Approval not found' });
    }

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Update approval record
    approval.status = 'APPROVED';
    approval.reviewed_by = req.user.id;
    approval.reviewed_at = new Date();
    approval.comment = comment || null;
    await approval.save();

    // Transition project status using workflow service
    try {
      await transitionStatus(projectId, 'APPROVED', req.user, comment);
    } catch (e) {
      // If transition fails (e.g., not in UNDER_REVIEW), just update the project directly
      project.status = 'APPROVED';
      project.updated_at = new Date();
      await project.save();
    }

    // Add timeline entry
    await ProjectTimeline.create({
      project_id: projectId,
      stage: 'APPROVED',
      actor: req.user.name,
      action: 'Approved',
      comment,
      changed_by_id: req.user.id,
    });

    await AuditLog.create({
      user_id: req.user.id,
      action: 'PROJECT_APPROVED',
      target_type: 'project',
      target_id: projectId,
      details: `Approved ${project.name}`,
    });

    // Return approval shape matching frontend mock
    const history = await ProjectTimeline.findAll({
      where: { project_id: projectId },
      order: [['created_at', 'ASC']],
      raw: true,
    });

    return res.json({
      id: approval.id,
      projectId: approval.project_id,
      projectName: project.name,
      department: project.department,
      status: 'APPROVED',
      priority: project.priority,
      submittedBy: approval.submitted_by,
      submittedAt: approval.submitted_at,
      reviewedBy: req.user.id,
      reviewedAt: approval.reviewed_at,
      comment: approval.comment,
      currentStage: 'APPROVED',
      history: history.map(h => ({
        stage: h.stage,
        actor: h.actor,
        action: h.action,
        timestamp: h.created_at,
        comment: h.comment,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { comment } = req.body || {};

    const approval = await Approval.findOne({ where: { project_id: projectId } });
    if (!approval) return res.status(404).json({ message: 'Approval not found' });

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    approval.status = 'REJECTED';
    approval.reviewed_by = req.user.id;
    approval.reviewed_at = new Date();
    approval.comment = comment || null;
    await approval.save();

    // Transition project status
    try {
      await transitionStatus(projectId, 'REJECTED', req.user, comment);
    } catch (e) {
      project.status = 'REJECTED';
      project.updated_at = new Date();
      await project.save();
    }

    await ProjectTimeline.create({
      project_id: projectId,
      stage: 'REJECTED',
      actor: req.user.name,
      action: 'Rejected',
      comment,
      changed_by_id: req.user.id,
    });

    await AuditLog.create({
      user_id: req.user.id,
      action: 'PROJECT_REJECTED',
      target_type: 'project',
      target_id: projectId,
      details: `Rejected ${project.name}: ${comment || ''}`,
    });

    const history = await ProjectTimeline.findAll({
      where: { project_id: projectId },
      order: [['created_at', 'ASC']],
      raw: true,
    });

    return res.json({
      id: approval.id,
      projectId: approval.project_id,
      projectName: project.name,
      department: project.department,
      status: 'REJECTED',
      priority: project.priority,
      submittedBy: approval.submitted_by,
      submittedAt: approval.submitted_at,
      reviewedBy: req.user.id,
      reviewedAt: approval.reviewed_at,
      comment: approval.comment,
      currentStage: 'REJECTED',
      history: history.map(h => ({
        stage: h.stage,
        actor: h.actor,
        action: h.action,
        timestamp: h.created_at,
        comment: h.comment,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const { projectId } = req.params;
    const history = await ProjectTimeline.findAll({
      where: { project_id: projectId },
      order: [['created_at', 'ASC']],
      raw: true,
    });

    // Match mock: returns array directly
    return res.json(history.map(h => ({
      stage: h.stage,
      actor: h.actor,
      action: h.action,
      timestamp: h.created_at,
      comment: h.comment,
    })));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, approve, reject, getHistory };

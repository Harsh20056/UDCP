const { Project, ProjectTimeline, AuditLog, sequelize } = require('../models');
const { STATUS_TRANSITIONS } = require('../config/constants');
const { detectConflicts, saveConflicts } = require('./conflictDetection.service');
const notificationService = require('./notification.service');

/**
 * Transition a project's status following the state machine.
 * Wrapped in a transaction: update project, insert timeline entry, audit log, notify.
 *
 * @param {string} projectId
 * @param {string} newStatus
 * @param {object} user - The user performing the transition
 * @param {string} [comment]
 * @returns {object} Updated project
 */
async function transitionStatus(projectId, newStatus, user, comment = null) {
  return sequelize.transaction(async (transaction) => {
    const project = await Project.findByPk(projectId, { transaction });
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    const currentStatus = project.status;
    const allowed = STATUS_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      const err = new Error(`Invalid transition from ${currentStatus} to ${newStatus}`);
      err.statusCode = 400;
      throw err;
    }

    const beforeState = project.toJSON();

    // 1. Update project status
    project.status = newStatus;
    project.updated_at = new Date();
    await project.save({ transaction });

    // 2. Insert timeline entry
    await ProjectTimeline.create({
      project_id: projectId,
      stage: newStatus,
      actor: user ? user.name : 'System',
      action: getActionLabel(newStatus),
      comment,
      changed_by_id: user ? user.id : null,
    }, { transaction });

    // 3. Insert audit log
    await AuditLog.create({
      user_id: user ? user.id : null,
      action: `PROJECT_STATUS_${newStatus}`,
      target_type: 'project',
      target_id: projectId,
      details: `Status changed from ${currentStatus} to ${newStatus}: ${project.name}`,
      before_state: beforeState,
      after_state: project.toJSON(),
    }, { transaction });

    // 4. Create notifications
    try {
      await notificationService.notifyStatusChange(project, currentStatus, newStatus, user, transaction);
    } catch (e) {
      console.error('Notification error (non-fatal):', e.message);
    }

    // 5. If transitioning to CONFLICT_ANALYSIS, run conflict detection
    if (newStatus === 'CONFLICT_ANALYSIS') {
      try {
        const conflicts = await detectConflicts(projectId);
        if (conflicts.length > 0) {
          await saveConflicts(conflicts, transaction);
          // Notify about conflicts
          for (const c of conflicts) {
            await notificationService.notifyConflictDetected(project, c, transaction);
          }
        }
      } catch (e) {
        console.error('Conflict detection error (non-fatal):', e.message);
      }
    }

    return project.toJSON();
  });
}

function getActionLabel(status) {
  const labels = {
    DRAFT: 'Returned to draft',
    SUBMITTED: 'Submitted for review',
    CONFLICT_ANALYSIS: 'Conflict analysis started',
    DEPT_NOTIFIED: 'Departments notified',
    UNDER_REVIEW: 'Taken for review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    SCHEDULED: 'Scheduled',
    IN_PROGRESS: 'Work started',
    COMPLETED: 'Completed',
  };
  return labels[status] || status;
}

module.exports = { transitionStatus };

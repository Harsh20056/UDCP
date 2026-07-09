const { Notification, CommunicationLog } = require('../models');

// Socket.io instance — set from server.js
let io = null;
function setIO(ioInstance) { io = ioInstance; }

/**
 * Create a notification and optionally emit via Socket.io.
 */
async function createNotification(data, transaction = null) {
  const notif = await Notification.create(data, { transaction });

  // Emit via Socket.io if available
  if (io) {
    if (data.user_id) {
      io.to(data.user_id).emit('notification:new', notif.toJSON());
    } else if (data.recipient_roles && data.recipient_roles.length) {
      // Broadcast to all — clients filter by role
      io.emit('notification:new', notif.toJSON());
    }
  }

  return notif;
}

/**
 * Create a simulated communication log entry (email/SMS).
 */
async function createCommunicationLog(data, transaction = null) {
  return CommunicationLog.create(data, { transaction });
}

/**
 * Notify about a status change.
 */
async function notifyStatusChange(project, fromStatus, toStatus, user, transaction) {
  const typeMap = {
    SUBMITTED: 'PROJECT_SUBMITTED',
    APPROVED: 'APPROVAL_GRANTED',
    REJECTED: 'APPROVAL_REJECTED',
  };

  const type = typeMap[toStatus] || 'PROJECT_UPDATED';
  const title = toStatus === 'APPROVED'
    ? `Project Approved: ${project.name}`
    : toStatus === 'REJECTED'
    ? `Project Rejected: ${project.name}`
    : toStatus === 'SUBMITTED'
    ? `New Project Registered: ${project.name}`
    : `Project Updated: ${project.name}`;

  const message = `${project.name} status changed from ${fromStatus} to ${toStatus}.`;

  const recipientRoles = ['admin', 'approver'];
  if (toStatus === 'APPROVED' || toStatus === 'REJECTED') {
    recipientRoles.push('department_planner');
  }

  const notif = await createNotification({
    type,
    title,
    message,
    related_project_id: project.id,
    recipient_roles: recipientRoles,
    is_read: false,
  }, transaction);

  // Simulated email
  await createCommunicationLog({
    channel: 'EMAIL',
    recipient: 'notifications@udcp.gov',
    subject: `[UDCP] ${title}`,
    body: message,
    related_notification_id: notif.id,
  }, transaction);

  return notif;
}

/**
 * Notify about a detected conflict.
 */
async function notifyConflictDetected(project, conflict, transaction) {
  const notif = await createNotification({
    type: 'CONFLICT_DETECTED',
    title: `Conflict Detected: ${conflict.roadName || project.name}`,
    message: `A ${conflict.riskLevel} risk conflict (score: ${conflict.conflictScore}/100) has been detected involving ${conflict.departmentsInvolved.join(', ')}.`,
    related_project_id: project.id,
    recipient_roles: ['admin', 'approver', 'department_planner'],
    is_read: false,
  }, transaction);

  // Simulated email
  await createCommunicationLog({
    channel: 'EMAIL',
    recipient: 'notifications@udcp.gov',
    subject: `[UDCP Alert] Conflict Detected — ${conflict.roadName || 'Unknown'}`,
    body: `A ${conflict.riskLevel} risk scheduling conflict (Score: ${conflict.conflictScore}/100) has been detected. Departments involved: ${conflict.departmentsInvolved.join(', ')}.`,
    related_notification_id: notif.id,
  }, transaction);

  return notif;
}

module.exports = { createNotification, createCommunicationLog, notifyStatusChange, notifyConflictDetected, setIO };

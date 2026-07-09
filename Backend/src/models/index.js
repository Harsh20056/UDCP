'use strict';

const { Sequelize } = require('sequelize');
const env = require('../config/env');

const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const db = {};

// Import models
db.User = require('./user.model')(sequelize, Sequelize.DataTypes);
db.Project = require('./project.model')(sequelize, Sequelize.DataTypes);
db.Conflict = require('./conflict.model')(sequelize, Sequelize.DataTypes);
db.ProjectTimeline = require('./projectTimeline.model')(sequelize, Sequelize.DataTypes);
db.Approval = require('./approval.model')(sequelize, Sequelize.DataTypes);
db.Notification = require('./notification.model')(sequelize, Sequelize.DataTypes);
db.CommunicationLog = require('./communicationLog.model')(sequelize, Sequelize.DataTypes);
db.AuditLog = require('./auditLog.model')(sequelize, Sequelize.DataTypes);

// ─── Associations ─────────────────────────────────────────────────────────────

// User -> Projects
db.User.hasMany(db.Project, { foreignKey: 'created_by_id', as: 'createdProjects' });
db.User.hasMany(db.Project, { foreignKey: 'assigned_officer_id', as: 'assignedProjects' });
db.Project.belongsTo(db.User, { foreignKey: 'created_by_id', as: 'creator' });
db.Project.belongsTo(db.User, { foreignKey: 'assigned_officer_id', as: 'assignedOfficerUser' });

// Project <-> Conflict (many-to-many through project_conflicts)
db.Project.belongsToMany(db.Conflict, {
  through: 'project_conflicts',
  foreignKey: 'project_id',
  otherKey: 'conflict_id',
  as: 'conflicts',
});
db.Conflict.belongsToMany(db.Project, {
  through: 'project_conflicts',
  foreignKey: 'conflict_id',
  otherKey: 'project_id',
  as: 'projects',
});

// Project -> Timeline
db.Project.hasMany(db.ProjectTimeline, { foreignKey: 'project_id', as: 'timeline' });
db.ProjectTimeline.belongsTo(db.Project, { foreignKey: 'project_id' });
db.ProjectTimeline.belongsTo(db.User, { foreignKey: 'changed_by_id', as: 'changedBy' });

// Project -> Approvals
db.Project.hasMany(db.Approval, { foreignKey: 'project_id', as: 'approvals' });
db.Approval.belongsTo(db.Project, { foreignKey: 'project_id' });
db.Approval.belongsTo(db.User, { foreignKey: 'submitted_by', as: 'submitter' });
db.Approval.belongsTo(db.User, { foreignKey: 'reviewed_by', as: 'reviewer' });

// User -> Notifications
db.User.hasMany(db.Notification, { foreignKey: 'user_id', as: 'notifications' });
db.Notification.belongsTo(db.User, { foreignKey: 'user_id' });
db.Notification.belongsTo(db.Project, { foreignKey: 'related_project_id', as: 'project' });
db.Notification.belongsTo(db.Conflict, { foreignKey: 'related_conflict_id', as: 'conflict' });

// Notification -> CommunicationLog
db.Notification.hasMany(db.CommunicationLog, { foreignKey: 'related_notification_id', as: 'communicationLogs' });
db.CommunicationLog.belongsTo(db.Notification, { foreignKey: 'related_notification_id' });

// User -> AuditLog
db.User.hasMany(db.AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
db.AuditLog.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

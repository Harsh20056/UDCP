const { Notification } = require('../models');
const { Op } = require('sequelize');

async function list(req, res, next) {
  try {
    // Get notifications relevant to the user's role
    const userRole = req.user.role;

    const notifications = await Notification.findAll({
      order: [['created_at', 'DESC']],
    });

    // Filter by recipient_roles (notifications where user's role is in the list)
    const filtered = notifications.filter(n => {
      const roles = n.recipient_roles || [];
      return roles.length === 0 || roles.includes(userRole);
    });

    const data = filtered.map(n => {
      const nj = n.toJSON();
      return {
        id: nj.id,
        type: nj.type,
        title: nj.title,
        message: nj.message,
        projectId: nj.related_project_id,
        conflictId: nj.related_conflict_id,
        read: nj.is_read,
        recipientRoles: nj.recipient_roles || [],
        createdAt: nj.created_at,
      };
    });

    const unread = data.filter(n => !n.read).length;

    return res.json({ data, total: data.length, unread });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (notif) {
      notif.is_read = true;
      await notif.save();
    }
    return res.json({ message: 'Marked as read.' });
  } catch (err) {
    next(err);
  }
}

async function getPreferences(req, res, next) {
  try {
    // Simulated — return default preferences
    return res.json({
      email: true,
      sms: false,
      inApp: true,
      conflictAlerts: true,
      approvalUpdates: true,
      projectUpdates: true,
    });
  } catch (err) {
    next(err);
  }
}

async function updatePreferences(req, res, next) {
  try {
    // Simulated — echo back what was sent
    return res.json(req.body);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, markRead, getPreferences, updatePreferences };

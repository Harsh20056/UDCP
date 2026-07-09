const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

/**
 * List audit logs with filtering.
 * Response shape matches frontend mock: { data, total, page, limit }.
 */
async function listAuditLogs(query) {
  const { user, action, dateFrom, dateTo, page = 1, limit = 25 } = query;
  const where = {};

  if (action) where.action = action;
  if (dateFrom || dateTo) {
    where.created_at = {};
    if (dateFrom) where.created_at[Op.gte] = new Date(dateFrom);
    if (dateTo) where.created_at[Op.lte] = new Date(dateTo);
  }

  // If user filter, we need to search by user_id or name
  let userIds = null;
  if (user) {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { id: user },
          { name: { [Op.iLike]: `%${user}%` } },
        ],
      },
      attributes: ['id'],
    });
    userIds = users.map(u => u.id);
    if (userIds.length > 0) {
      where.user_id = { [Op.in]: userIds };
    } else {
      // No matching users, return empty
      return { data: [], total: 0, page: parseInt(page), limit: parseInt(limit) };
    }
  }

  const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const { count, rows } = await AuditLog.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  const data = rows.map(row => {
    const r = row.toJSON();
    return {
      id: r.id,
      userId: r.user_id,
      userName: r.user ? r.user.name : 'Unknown',
      action: r.action,
      resource: r.target_type,
      resourceId: r.target_id,
      details: r.details,
      timestamp: r.created_at,
    };
  });

  return { data, total: count, page: parseInt(page), limit: parseInt(limit) };
}

module.exports = { listAuditLogs };

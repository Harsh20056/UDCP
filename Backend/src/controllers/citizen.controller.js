const { Sequelize } = require('sequelize');
const { sequelize } = require('../models');
const { CommunicationLog } = require('../models');

async function getPublicProjects(req, res, next) {
  try {
    const { search } = req.query;
    const publicStatuses = ['IN_PROGRESS', 'SCHEDULED', 'APPROVED', 'COMPLETED'];

    let whereClause = `WHERE p.status IN (:statuses)`;
    const replacements = { statuses: publicStatuses };

    if (search) {
      whereClause += ` AND (p.name ILIKE :search OR p.address ILIKE :search)`;
      replacements.search = `%${search}%`;
    }

    const rows = await sequelize.query(`
      SELECT p.id, p.name, p.department, p.description, p.budget, p.budget_utilized,
             p.start_date, p.end_date, p.status, p.priority, p.address, p.road_name,
             p.progress_percent, p.assigned_officer, p.created_at, p.updated_at,
             ST_AsGeoJSON(p.location) as location_geojson
      FROM projects p
      ${whereClause}
      ORDER BY p.updated_at DESC
    `, { replacements, type: Sequelize.QueryTypes.SELECT });

    const data = rows.map(r => {
      let location = { lat: 0, lng: 0, address: r.address || '', roadName: r.road_name || '' };
      if (r.location_geojson) {
        try {
          const geoj = JSON.parse(r.location_geojson);
          location = { lat: geoj.coordinates[1], lng: geoj.coordinates[0], address: r.address || '', roadName: r.road_name || '' };
        } catch (e) {}
      }
      return {
        id: r.id,
        name: r.name,
        department: r.department,
        description: r.description,
        budget: parseFloat(r.budget) || 0,
        budgetUtilized: parseFloat(r.budget_utilized) || 0,
        startDate: r.start_date,
        endDate: r.end_date,
        status: r.status,
        priority: r.priority,
        location,
        assignedOfficer: r.assigned_officer || '',
        progressPercent: r.progress_percent || 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });

    return res.json({ data, total: data.length });
  } catch (err) {
    next(err);
  }
}

async function submitFeedback(req, res, next) {
  try {
    // Simulated — just acknowledge receipt
    return res.status(201).json({ message: 'Feedback submitted successfully. Thank you!' });
  } catch (err) {
    next(err);
  }
}

async function getEmailSmsLog(req, res, next) {
  try {
    const logs = await CommunicationLog.findAll({
      order: [['sent_at', 'DESC']],
      raw: true,
    });

    const data = logs.map(l => ({
      id: l.id,
      channel: l.channel,
      to: l.recipient,
      subject: l.subject,
      preview: l.body,
      triggeredBy: l.related_notification_id,
      sentAt: l.sent_at,
    }));

    return res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPublicProjects, submitFeedback, getEmailSmsLog };

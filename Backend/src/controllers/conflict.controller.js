const { Conflict, Project, AuditLog, sequelize } = require('../models');
const { Sequelize } = require('sequelize');

async function list(req, res, next) {
  try {
    const { riskLevel, department, status } = req.query;
    const where = {};
    if (riskLevel) where.risk_level = riskLevel;
    if (status) where.status = status;

    let conflicts = await Conflict.findAll({
      where,
      include: [{
        model: Project,
        as: 'projects',
        attributes: ['id', 'name', 'department'],
        through: { attributes: [] },
      }],
      order: [['detected_at', 'DESC']],
    });

    // Filter by department (user scoped department takes precedence for security)
    const userDept = req.user && req.user.department && req.user.role !== 'admin' && req.user.role !== 'approver' ? req.user.department : null;
    const filterDept = userDept || department;

    if (filterDept) {
      conflicts = conflicts.filter(c => {
        const depts = c.departments_involved || [];
        return depts.includes(filterDept);
      });
    }

    // Format to match frontend mock shape
    const data = conflicts.map(c => {
      const cj = c.toJSON();
      return {
        id: cj.id,
        involvedProjectIds: cj.projects ? cj.projects.map(p => p.id) : [],
        conflictType: cj.conflict_type,
        conflictScore: cj.conflict_score,
        riskLevel: cj.risk_level,
        departmentsInvolved: cj.departments_involved || [],
        suggestedActions: cj.suggested_actions || [],
        status: cj.status,
        detectedAt: cj.detected_at,
        locationDescription: cj.location_description,
        roadName: cj.road_name,
      };
    });

    return res.json({ data, total: data.length });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const conflict = await Conflict.findByPk(req.params.id, {
      include: [{
        model: Project,
        as: 'projects',
        through: { attributes: [] },
      }],
    });

    if (!conflict) return res.status(404).json({ message: 'Conflict not found' });

    const cj = conflict.toJSON();

    // Get involved projects with location data
    const involvedProjects = [];
    for (const p of cj.projects) {
      const [row] = await sequelize.query(
        `SELECT id, name, department, status, priority, address, road_name, start_date, end_date, ST_AsGeoJSON(location) as location_geojson FROM projects WHERE id = :id`,
        { replacements: { id: p.id }, type: Sequelize.QueryTypes.SELECT }
      );
      if (row) {
        let location = { lat: 0, lng: 0, address: row.address, roadName: row.road_name };
        if (row.location_geojson) {
          try {
            const geoj = JSON.parse(row.location_geojson);
            location = { lat: geoj.coordinates[1], lng: geoj.coordinates[0], address: row.address, roadName: row.road_name };
          } catch (e) {}
        }
        involvedProjects.push({
          id: row.id,
          name: row.name,
          department: row.department,
          status: row.status,
          priority: row.priority,
          location,
          startDate: row.start_date,
          endDate: row.end_date,
        });
      }
    }

    const result = {
      id: cj.id,
      involvedProjectIds: cj.projects.map(p => p.id),
      conflictType: cj.conflict_type,
      conflictScore: cj.conflict_score,
      riskLevel: cj.risk_level,
      departmentsInvolved: cj.departments_involved || [],
      suggestedActions: cj.suggested_actions || [],
      status: cj.status,
      detectedAt: cj.detected_at,
      locationDescription: cj.location_description,
      roadName: cj.road_name,
      involvedProjects,
    };

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

async function resolve(req, res, next) {
  try {
    const conflict = await Conflict.findByPk(req.params.id);
    if (!conflict) return res.status(404).json({ message: 'Conflict not found' });

    conflict.status = 'RESOLVED';
    conflict.resolved_at = new Date();
    await conflict.save();

    await AuditLog.create({
      user_id: req.user.id,
      action: 'CONFLICT_RESOLVED',
      target_type: 'conflict',
      target_id: conflict.id,
      details: `Resolved conflict ${conflict.id}`,
    });

    const cj = conflict.toJSON();
    return res.json({
      id: cj.id,
      conflictType: cj.conflict_type,
      conflictScore: cj.conflict_score,
      riskLevel: cj.risk_level,
      status: cj.status,
      departmentsInvolved: cj.departments_involved || [],
      suggestedActions: cj.suggested_actions || [],
      detectedAt: cj.detected_at,
      locationDescription: cj.location_description,
      roadName: cj.road_name,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, resolve };

const { Sequelize } = require('sequelize');
const { Conflict, Project, sequelize } = require('../models');
const { MAP_CONFIG } = require('../config/constants');

/**
 * Score → Risk level mapping (same thresholds as frontend's conflictScoring.js).
 */
function scoreToRisk(score) {
  if (score >= 85) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

/**
 * Build suggested action text templates.
 */
function buildSuggestedActions(type, projectA, projectB) {
  const templates = {
    SAME_ROAD_EXCAVATION: [
      `Coordinate excavation windows with ${projectB.department} — their project on ${projectB.road_name} runs ${projectB.start_date} to ${projectB.end_date}.`,
      `Consider joint trenching to avoid duplicate excavation costs and road surface damage.`,
      `Designate a shared Coordination Officer for weekly joint site reviews.`,
      `Communicate combined traffic diversion plan to Traffic Police.`,
    ],
    LOCATION_OVERLAP: [
      `${projectA.department} and ${projectB.department} projects are within ${MAP_CONFIG.CONFLICT_RADIUS_M}m of each other.`,
      `Schedule pre-work coordination meeting between ${projectA.department} and ${projectB.department} project managers.`,
      `Ensure no heavy equipment access conflicts during overlapping periods.`,
    ],
    TIMELINE_OVERLAP: [
      `${projectA.name} and ${projectB.name} have overlapping timelines (${projectA.start_date}–${projectA.end_date}).`,
      `Consider staggering start dates by 2–4 weeks to reduce simultaneous disruption to the area.`,
      `Prepare a combined public communication plan for the affected locality.`,
    ],
    DUPLICATE_REQUEST: [
      `Similar work appears to be requested by two departments in the same area.`,
      `Review both project scopes — one may be redundant, or they can be merged for efficiency.`,
      `Escalate to City Manager for deduplication decision.`,
    ],
  };
  return templates[type] || [];
}

/**
 * Run conflict detection for a project against all existing projects.
 * Uses PostGIS ST_DWithin for real spatial queries.
 *
 * @param {string} projectId - ID of the project to check
 * @returns {Array} Array of detected conflicts
 */
async function detectConflicts(projectId) {
  // Get the target project with its geometry
  const [targetProject] = await sequelize.query(`
    SELECT id, name, department, start_date, end_date, road_name, address,
           ST_AsGeoJSON(location) as location_geojson, location
    FROM projects WHERE id = :projectId
  `, { replacements: { projectId }, type: Sequelize.QueryTypes.SELECT });

  if (!targetProject) return [];

  const newConflicts = [];

  // 1. Location overlap — projects within 150m using PostGIS ST_DWithin
  const nearbyProjects = await sequelize.query(`
    SELECT id, name, department, start_date, end_date, road_name, address,
           ST_Distance(location::geography, (SELECT location::geography FROM projects WHERE id = :projectId)) AS distance_m,
           ST_AsGeoJSON(location) as location_geojson
    FROM projects
    WHERE id != :projectId
      AND status NOT IN ('COMPLETED', 'REJECTED')
      AND department != :department
      AND ST_DWithin(
        location::geography,
        (SELECT location::geography FROM projects WHERE id = :projectId),
        :radius
      )
      AND start_date <= :endDate AND end_date >= :startDate
  `, {
    replacements: {
      projectId,
      department: targetProject.department,
      radius: MAP_CONFIG.CONFLICT_RADIUS_M * 5, // wider search for timeline overlap
      startDate: targetProject.start_date,
      endDate: targetProject.end_date,
    },
    type: Sequelize.QueryTypes.SELECT,
  });

  for (const other of nearbyProjects) {
    let conflictScore = 0;
    let conflictType = null;

    // Check: Same-road excavation (highest severity)
    if (
      targetProject.road_name &&
      other.road_name &&
      targetProject.road_name.toLowerCase() === other.road_name.toLowerCase()
    ) {
      conflictScore = 85 + Math.round(Math.random() * 15);
      conflictType = 'SAME_ROAD_EXCAVATION';
    }
    // Check: Location overlap (close proximity)
    else if (parseFloat(other.distance_m) < MAP_CONFIG.CONFLICT_RADIUS_M) {
      const proximityFactor = 1 - parseFloat(other.distance_m) / MAP_CONFIG.CONFLICT_RADIUS_M;
      conflictScore = Math.round(60 + proximityFactor * 25);
      conflictType = 'LOCATION_OVERLAP';
    }
    // Check: Timeline overlap without close location
    else if (parseFloat(other.distance_m) < MAP_CONFIG.CONFLICT_RADIUS_M * 5) {
      conflictScore = 30 + Math.round(Math.random() * 30);
      conflictType = 'TIMELINE_OVERLAP';
    }

    if (conflictType && conflictScore >= 25) {
      newConflicts.push({
        conflictType,
        conflictScore,
        riskLevel: scoreToRisk(conflictScore),
        departmentsInvolved: [targetProject.department, other.department],
        suggestedActions: buildSuggestedActions(conflictType, targetProject, other),
        locationDescription: `${targetProject.address || targetProject.road_name || 'Unknown location'}`,
        roadName: targetProject.road_name || other.road_name || '',
        involvedProjectIds: [projectId, other.id],
      });
    }
  }

  // Also check for same-road projects not in the spatial radius but matching road_name
  if (targetProject.road_name) {
    const sameRoadProjects = await sequelize.query(`
      SELECT id, name, department, start_date, end_date, road_name, address
      FROM projects
      WHERE id != :projectId
        AND status NOT IN ('COMPLETED', 'REJECTED')
        AND department != :department
        AND LOWER(road_name) = LOWER(:roadName)
        AND start_date <= :endDate AND end_date >= :startDate
        AND id NOT IN (:excludeIds)
    `, {
      replacements: {
        projectId,
        department: targetProject.department,
        roadName: targetProject.road_name,
        startDate: targetProject.start_date,
        endDate: targetProject.end_date,
        excludeIds: nearbyProjects.map(p => p.id).concat([projectId]),
      },
      type: Sequelize.QueryTypes.SELECT,
    });

    for (const other of sameRoadProjects) {
      const conflictScore = 85 + Math.round(Math.random() * 15);
      newConflicts.push({
        conflictType: 'SAME_ROAD_EXCAVATION',
        conflictScore,
        riskLevel: scoreToRisk(conflictScore),
        departmentsInvolved: [targetProject.department, other.department],
        suggestedActions: buildSuggestedActions('SAME_ROAD_EXCAVATION', targetProject, other),
        locationDescription: `${targetProject.address || targetProject.road_name}`,
        roadName: targetProject.road_name,
        involvedProjectIds: [projectId, other.id],
      });
    }
  }

  return newConflicts;
}

/**
 * Save detected conflicts to the database.
 * Creates conflict rows and project_conflicts join entries.
 */
async function saveConflicts(conflicts, transaction) {
  const savedConflicts = [];

  for (const c of conflicts) {
    const conflict = await Conflict.create({
      conflict_type: c.conflictType,
      conflict_score: c.conflictScore,
      risk_level: c.riskLevel,
      status: 'OPEN',
      departments_involved: c.departmentsInvolved,
      suggested_actions: c.suggestedActions,
      location_description: c.locationDescription,
      road_name: c.roadName,
      detected_at: new Date(),
    }, { transaction });

    // Create join table entries
    for (const pid of c.involvedProjectIds) {
      await sequelize.query(
        `INSERT INTO project_conflicts (project_id, conflict_id) VALUES (:pid, :cid) ON CONFLICT DO NOTHING`,
        { replacements: { pid, cid: conflict.id }, transaction }
      );
    }

    savedConflicts.push(conflict);
  }

  return savedConflicts;
}

module.exports = { detectConflicts, saveConflicts, scoreToRisk };

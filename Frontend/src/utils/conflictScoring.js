// Client-side conflict detection engine.
// Runs against the in-memory project list whenever a project is created or edited.
// Produces the same output shape the real backend conflict engine will return.

import { MAP_CONFIG } from '../config/constants.js';

// ─── Haversine distance (metres) ─────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000; // earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Date range overlap check ─────────────────────────────────────────────────
function datesOverlap(start1, end1, start2, end2) {
  return new Date(start1) <= new Date(end2) && new Date(end1) >= new Date(start2);
}

// ─── Risk level from score ────────────────────────────────────────────────────
function scoreToRisk(score) {
  if (score >= 85) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

// ─── Suggested action templates ───────────────────────────────────────────────
function buildSuggestedActions(type, projectA, projectB) {
  const templates = {
    SAME_ROAD_EXCAVATION: [
      `Coordinate excavation windows with ${projectB.department} — their project on ${projectB.location.roadName} runs ${projectB.startDate} to ${projectB.endDate}.`,
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
      `${projectA.name} and ${projectB.name} have overlapping timelines (${projectA.startDate}–${projectA.endDate}).`,
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

// ─── Main conflict scoring function ──────────────────────────────────────────
/**
 * Detect conflicts between a target project and all existing projects.
 * @param {object} targetProject - The project to check (new or edited).
 * @param {object[]} allProjects - All existing projects in the system.
 * @returns {object[]} Array of detected conflict objects.
 */
export function detectConflicts(targetProject, allProjects) {
  const newConflicts = [];

  for (const other of allProjects) {
    if (other.id === targetProject.id) continue;
    if (other.department === targetProject.department) continue; // Same dept, no conflict
    if (!datesOverlap(targetProject.startDate, targetProject.endDate, other.startDate, other.endDate)) continue;

    let conflictScore = 0;
    let conflictType = null;

    const dist = haversine(
      targetProject.location.lat, targetProject.location.lng,
      other.location.lat, other.location.lng
    );

    // Check: Same-road excavation (highest severity)
    if (
      targetProject.location.roadName &&
      other.location.roadName &&
      targetProject.location.roadName.toLowerCase() === other.location.roadName.toLowerCase()
    ) {
      conflictScore = 85 + Math.random() * 15; // 85–100
      conflictType = 'SAME_ROAD_EXCAVATION';
    }
    // Check: Location overlap (close proximity)
    else if (dist < MAP_CONFIG.CONFLICT_RADIUS_M) {
      const proximityFactor = 1 - dist / MAP_CONFIG.CONFLICT_RADIUS_M;
      conflictScore = 60 + proximityFactor * 25;
      conflictType = 'LOCATION_OVERLAP';
    }
    // Check: Timeline overlap without location overlap
    else if (dist < MAP_CONFIG.CONFLICT_RADIUS_M * 5) {
      conflictScore = 30 + Math.random() * 30;
      conflictType = 'TIMELINE_OVERLAP';
    }

    if (conflictType && conflictScore >= 25) {
      newConflicts.push({
        id: `CON-${Date.now()}-${other.id}`,
        involvedProjectIds: [targetProject.id, other.id],
        conflictType,
        conflictScore: Math.round(conflictScore),
        riskLevel: scoreToRisk(conflictScore),
        departmentsInvolved: [targetProject.department, other.department],
        suggestedActions: buildSuggestedActions(conflictType, targetProject, other),
        status: 'OPEN',
        detectedAt: new Date().toISOString(),
        locationDescription: `${targetProject.location.address}`,
        roadName: targetProject.location.roadName,
      });
    }
  }

  return newConflicts;
}

/**
 * Convenience wrapper: run conflict detection and return a summary.
 */
export function runConflictCheck(project, allProjects) {
  const detected = detectConflicts(project, allProjects);
  const highestScore = detected.length ? Math.max(...detected.map(c => c.conflictScore)) : 0;
  return {
    hasConflicts: detected.length > 0,
    conflictCount: detected.length,
    conflicts: detected,
    highestScore,
    highestRisk: scoreToRisk(highestScore),
  };
}

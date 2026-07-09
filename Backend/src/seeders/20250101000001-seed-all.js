'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// ─── Fixed UUIDs so FKs work across all seed tables ──────────────────────────
const USER_IDS = {
  'usr-001': uuidv4(), // Raj Sharma — admin
  'usr-002': uuidv4(), // Priya Verma — planner
  'usr-003': uuidv4(), // Anil Kumar — approver
  'usr-004': uuidv4(), // Sunita Patel — field_engineer
  'usr-005': uuidv4(), // Vikram Singh — citizen
  'usr-006': uuidv4(), // Deepak Mishra — pending
  'usr-007': uuidv4(), // Kavita Joshi — pending
};

const PROJECT_IDS = {
  'PRJ-2025-001': uuidv4(),
  'PRJ-2025-002': uuidv4(),
  'PRJ-2025-003': uuidv4(),
  'PRJ-2025-004': uuidv4(),
  'PRJ-2025-005': uuidv4(),
  'PRJ-2025-006': uuidv4(),
  'PRJ-2025-007': uuidv4(),
  'PRJ-2025-008': uuidv4(),
  'PRJ-2025-009': uuidv4(),
  'PRJ-2025-010': uuidv4(),
  'PRJ-2025-011': uuidv4(),
  'PRJ-2025-012': uuidv4(),
  'PRJ-2025-013': uuidv4(),
  'PRJ-2025-014': uuidv4(),
  'PRJ-2025-015': uuidv4(),
  'PRJ-2025-016': uuidv4(),
  'PRJ-2025-017': uuidv4(),
  'PRJ-2025-018': uuidv4(),
  'PRJ-2025-019': uuidv4(),
  'PRJ-2025-020': uuidv4(),
};

const CONFLICT_IDS = {
  'CON-001': uuidv4(),
  'CON-002': uuidv4(),
  'CON-003': uuidv4(),
  'CON-004': uuidv4(),
  'CON-005': uuidv4(),
};

const NOTIFICATION_IDS = {
  'NOT-001': uuidv4(),
  'NOT-002': uuidv4(),
  'NOT-003': uuidv4(),
  'NOT-004': uuidv4(),
  'NOT-005': uuidv4(),
  'NOT-006': uuidv4(),
  'NOT-007': uuidv4(),
  'NOT-008': uuidv4(),
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // ─── 1. USERS ─────────────────────────────────────────────────────────
    const hashAdmin = await bcrypt.hash('Admin@123', 10);
    const hashStaff = await bcrypt.hash('Staff@123', 10);
    const hashCitizen = await bcrypt.hash('Citizen@123', 10);

    await queryInterface.bulkInsert('users', [
      { id: USER_IDS['usr-001'], name: 'Admin User',     email: 'admin@udcp.gov',    password_hash: hashAdmin,   role: 'admin',              department: null,                    status: 'ACTIVE',           designation: 'City Manager',              phone: '+91-9876543210', created_at: '2025-01-15T09:00:00Z', updated_at: '2025-01-15T09:00:00Z' },
      { id: USER_IDS['usr-002'], name: 'Planner User',   email: 'planner@udcp.gov',  password_hash: hashStaff,   role: 'department_planner', department: 'PWD',                   status: 'ACTIVE',           designation: 'Senior Project Planner',    phone: '+91-9876543211', created_at: '2025-02-01T09:00:00Z', updated_at: '2025-02-01T09:00:00Z' },
      { id: USER_IDS['usr-003'], name: 'Approver User',  email: 'approver@udcp.gov', password_hash: hashStaff,   role: 'approver',           department: 'Municipal Corporation', status: 'ACTIVE',           designation: 'Chief Approval Officer',    phone: '+91-9876543212', created_at: '2025-02-10T09:00:00Z', updated_at: '2025-02-10T09:00:00Z' },
      { id: USER_IDS['usr-004'], name: 'Engineer User',  email: 'engineer@udcp.gov', password_hash: hashStaff,   role: 'field_engineer',     department: 'Water Supply & Sewerage', status: 'ACTIVE',         designation: 'Field Engineer II',         phone: '+91-9876543213', created_at: '2025-03-05T09:00:00Z', updated_at: '2025-03-05T09:00:00Z' },
      { id: USER_IDS['usr-005'], name: 'Citizen User',   email: 'citizen@udcp.gov',  password_hash: hashCitizen, role: 'public_viewer',      department: null,                    status: 'ACTIVE',           designation: 'Citizen',                   phone: '+91-9876543214', created_at: '2025-04-20T09:00:00Z', updated_at: '2025-04-20T09:00:00Z' },
      { id: USER_IDS['usr-006'], name: 'Pending Planner', email: 'pending.planner@udcp.gov', password_hash: hashStaff, role: 'department_planner', department: 'Electricity Board', status: 'PENDING_APPROVAL', designation: 'Junior Project Planner', phone: '+91-9876543215', created_at: '2026-07-07T11:30:00Z', updated_at: '2026-07-07T11:30:00Z' },
      { id: USER_IDS['usr-007'], name: 'Pending Engineer', email: 'pending.engineer@udcp.gov', password_hash: hashStaff, role: 'field_engineer',     department: 'Telecom',           status: 'PENDING_APPROVAL', designation: 'Field Engineer I',       phone: '+91-9876543216', created_at: '2026-07-07T14:15:00Z', updated_at: '2026-07-07T14:15:00Z' },
    ]);

    // ─── 2. PROJECTS (with PostGIS geometry) ──────────────────────────────
    const projects = [
      { id: PROJECT_IDS['PRJ-2025-001'], name: 'Hoshangabad Road Expansion Phase 2', department: 'PWD', description: 'Widening of Hoshangabad Road from 2-lane to 4-lane between Bittan Market and BHEL Square. Includes new storm drains and footpaths.', budget: 45000000, budget_utilized: 18500000, start_date: '2025-11-01', end_date: '2026-08-31', status: 'IN_PROGRESS', priority: 'HIGH', address: 'Hoshangabad Road, Bhopal', road_name: 'Hoshangabad Road', progress_percent: 41, assigned_officer: 'Priya Verma', assigned_officer_id: USER_IDS['usr-002'], created_by_id: USER_IDS['usr-002'], lat: 23.2156, lng: 77.4142, created_at: '2025-10-15T09:00:00Z', updated_at: '2026-06-20T11:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-002'], name: 'MP Nagar Road Resurfacing', department: 'PWD', description: 'Complete resurfacing of Zone-II roads in MP Nagar, including patching and crack sealing.', budget: 8500000, budget_utilized: 8500000, start_date: '2025-06-01', end_date: '2025-09-30', status: 'COMPLETED', priority: 'MEDIUM', address: 'MP Nagar Zone-2, Bhopal', road_name: 'Zone-2 Road MP Nagar', progress_percent: 100, assigned_officer: 'Priya Verma', assigned_officer_id: USER_IDS['usr-002'], created_by_id: USER_IDS['usr-002'], lat: 23.2310, lng: 77.4340, created_at: '2025-05-20T09:00:00Z', updated_at: '2025-09-28T16:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-003'], name: 'New Market Flyover Repair', department: 'PWD', description: 'Structural repairs and waterproofing of the New Market flyover. Traffic diversion in effect during repairs.', budget: 12000000, budget_utilized: 2400000, start_date: '2026-08-15', end_date: '2026-12-31', status: 'APPROVED', priority: 'CRITICAL', address: 'New Market Flyover, Bhopal', road_name: 'New Market Road', progress_percent: 0, assigned_officer: 'Rajan Dubey', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.2344, lng: 77.4192, created_at: '2026-07-01T09:00:00Z', updated_at: '2026-07-05T14:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-004'], name: 'Arera Colony Water Main Replacement', department: 'Water Supply & Sewerage', description: 'Replacement of 40-year-old asbestos cement water mains in E-7, E-8 sectors of Arera Colony. Includes new 200mm DI pipes.', budget: 32000000, budget_utilized: 14400000, start_date: '2025-09-01', end_date: '2026-03-31', status: 'COMPLETED', priority: 'HIGH', address: 'E-7 Arera Colony, Bhopal', road_name: 'E-7 Arera Colony Road', progress_percent: 100, assigned_officer: 'Sunita Patel', assigned_officer_id: USER_IDS['usr-004'], created_by_id: USER_IDS['usr-004'], lat: 23.2062, lng: 77.4356, created_at: '2025-08-20T09:00:00Z', updated_at: '2026-04-02T09:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-005'], name: 'Kolar Road Sewage Upgrade', department: 'Water Supply & Sewerage', description: 'Upgrading sewer line capacity on Kolar Road from NH12 junction to Ayodhya Bypass to handle growing population.', budget: 28000000, budget_utilized: 8400000, start_date: '2026-03-01', end_date: '2026-09-30', status: 'IN_PROGRESS', priority: 'HIGH', address: 'Kolar Road, Bhopal', road_name: 'Kolar Road', progress_percent: 30, assigned_officer: 'Sunita Patel', assigned_officer_id: USER_IDS['usr-004'], created_by_id: USER_IDS['usr-004'], lat: 23.1723, lng: 77.3970, created_at: '2026-02-15T09:00:00Z', updated_at: '2026-07-01T10:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-006'], name: 'Bittan Market Water Pressure Boost', department: 'Water Supply & Sewerage', description: 'Installation of booster pumping station to improve water pressure in Bittan Market locality.', budget: 5500000, budget_utilized: 0, start_date: '2026-10-01', end_date: '2026-12-31', status: 'DRAFT', priority: 'MEDIUM', address: 'Bittan Market, Bhopal', road_name: 'Bittan Market Road', progress_percent: 0, assigned_officer: 'Ramesh Tiwari', assigned_officer_id: null, created_by_id: USER_IDS['usr-004'], lat: 23.2050, lng: 77.4270, created_at: '2026-07-06T11:00:00Z', updated_at: '2026-07-06T11:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-007'], name: 'Hoshangabad Road Underground Cabling', department: 'Electricity Board', description: 'Replacing overhead power lines with underground cables along Hoshangabad Road for aesthetic improvement and safety. Requires road excavation.', budget: 55000000, budget_utilized: 11000000, start_date: '2026-06-15', end_date: '2026-12-31', status: 'UNDER_REVIEW', priority: 'HIGH', address: 'Hoshangabad Road (E-Section), Bhopal', road_name: 'Hoshangabad Road', progress_percent: 8, assigned_officer: 'Mohan Yadav', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.2200, lng: 77.4100, created_at: '2026-05-01T09:00:00Z', updated_at: '2026-07-03T09:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-008'], name: 'North TT Nagar Substation Upgrade', department: 'Electricity Board', description: 'Capacity upgrade of TT Nagar substation from 33kV to 132kV to meet increasing demand.', budget: 78000000, budget_utilized: 0, start_date: '2026-09-01', end_date: '2027-06-30', status: 'SUBMITTED', priority: 'CRITICAL', address: 'TT Nagar, Bhopal', road_name: 'TT Nagar Road', progress_percent: 0, assigned_officer: 'Mohan Yadav', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.2540, lng: 77.4042, created_at: '2026-07-05T09:00:00Z', updated_at: '2026-07-05T09:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-009'], name: 'MP Nagar 5G Fiber Backbone', department: 'Telecom', description: 'Laying fiber optic backbone cables for 5G rollout in MP Nagar commercial zone. Trenching along main arterial roads.', budget: 18000000, budget_utilized: 9000000, start_date: '2026-04-01', end_date: '2026-10-31', status: 'IN_PROGRESS', priority: 'HIGH', address: 'MP Nagar Zone-1, Bhopal', road_name: 'Zone-1 Road MP Nagar', progress_percent: 50, assigned_officer: 'Rakesh Gupta', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.2280, lng: 77.4360, created_at: '2026-03-15T09:00:00Z', updated_at: '2026-07-01T10:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-010'], name: 'Rohit Nagar OFC Duct Laying', department: 'Telecom', description: 'Optical fiber duct installation in Rohit Nagar residential area as part of smart city connectivity initiative.', budget: 9500000, budget_utilized: 0, start_date: '2026-11-01', end_date: '2027-02-28', status: 'DRAFT', priority: 'MEDIUM', address: 'Rohit Nagar, Bhopal', road_name: 'Rohit Nagar Main Road', progress_percent: 0, assigned_officer: 'Rakesh Gupta', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.2710, lng: 77.3900, created_at: '2026-07-06T14:00:00Z', updated_at: '2026-07-06T14:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-011'], name: 'New Market Smart Traffic Signal Installation', department: 'Traffic Police', description: 'Installation of AI-powered adaptive traffic signals at 12 intersections in New Market area to reduce congestion.', budget: 14000000, budget_utilized: 14000000, start_date: '2025-10-01', end_date: '2026-01-31', status: 'COMPLETED', priority: 'HIGH', address: 'New Market Chowk, Bhopal', road_name: 'New Market Road', progress_percent: 100, assigned_officer: 'Deepa Singh', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.2361, lng: 77.4218, created_at: '2025-09-15T09:00:00Z', updated_at: '2026-02-01T09:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-012'], name: 'Kolar Road Traffic Safety Upgrades', department: 'Traffic Police', description: 'Road marking, crash barriers, and improved signage on Kolar Road high-accident stretch near NH12.', budget: 6200000, budget_utilized: 1240000, start_date: '2026-07-01', end_date: '2026-09-30', status: 'SCHEDULED', priority: 'HIGH', address: 'Kolar Road NH12 Junction, Bhopal', road_name: 'Kolar Road', progress_percent: 5, assigned_officer: 'Deepa Singh', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.1690, lng: 77.3940, created_at: '2026-06-15T09:00:00Z', updated_at: '2026-07-01T09:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-013'], name: 'Arera Colony Footpath Development', department: 'Municipal Corporation', description: 'Construction of 15km continuous footpath with tactile tiles, ramps, and tree plantation in Arera Colony sectors.', budget: 22000000, budget_utilized: 8800000, start_date: '2026-02-01', end_date: '2026-07-31', status: 'IN_PROGRESS', priority: 'MEDIUM', address: 'C-Sector Arera Colony, Bhopal', road_name: 'Arera Colony Main Road', progress_percent: 60, assigned_officer: 'Mamta Sharma', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.2010, lng: 77.4310, created_at: '2026-01-20T09:00:00Z', updated_at: '2026-07-01T10:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-014'], name: 'Bittan Market Public Plaza', department: 'Municipal Corporation', description: 'Redevelopment of Bittan Market public square with seating, lighting, and vendor stalls.', budget: 11500000, budget_utilized: 0, start_date: '2026-09-01', end_date: '2027-01-31', status: 'UNDER_REVIEW', priority: 'LOW', address: 'Bittan Market Square, Bhopal', road_name: 'Bittan Market Square', progress_percent: 0, assigned_officer: 'Mamta Sharma', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.2080, lng: 77.4290, created_at: '2026-06-25T09:00:00Z', updated_at: '2026-07-04T09:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-015'], name: 'Jahangirabad Street Light Replacement', department: 'Municipal Corporation', description: 'Replacing sodium vapour street lights with LED fixtures in Jahangirabad ward for 40% energy saving.', budget: 7800000, budget_utilized: 7800000, start_date: '2025-11-01', end_date: '2026-02-28', status: 'COMPLETED', priority: 'MEDIUM', address: 'Jahangirabad, Bhopal', road_name: 'Jahangirabad Main Road', progress_percent: 100, assigned_officer: 'Pankaj Rawat', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.2680, lng: 77.4380, created_at: '2025-10-15T09:00:00Z', updated_at: '2026-03-01T09:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-016'], name: 'Hoshangabad Road PNG Pipeline Laying', department: 'Gas Authority', description: 'Piped Natural Gas distribution pipeline along Hoshangabad Road for domestic and commercial connections.', budget: 38000000, budget_utilized: 7600000, start_date: '2026-05-01', end_date: '2026-11-30', status: 'IN_PROGRESS', priority: 'HIGH', address: 'Hoshangabad Road (W-Section), Bhopal', road_name: 'Hoshangabad Road', progress_percent: 20, assigned_officer: 'Suresh Bose', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.2180, lng: 77.4120, created_at: '2026-04-15T09:00:00Z', updated_at: '2026-07-01T09:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-017'], name: 'Shahpura PNG Extension', department: 'Gas Authority', description: 'Extending piped gas network to Shahpura residential area, covering 2,400 households.', budget: 24000000, budget_utilized: 0, start_date: '2026-12-01', end_date: '2027-05-31', status: 'CONFLICT_ANALYSIS', priority: 'MEDIUM', address: 'Shahpura, Bhopal', road_name: 'Shahpura Main Road', progress_percent: 0, assigned_officer: 'Suresh Bose', assigned_officer_id: null, created_by_id: USER_IDS['usr-001'], lat: 23.1850, lng: 77.4500, created_at: '2026-07-06T16:00:00Z', updated_at: '2026-07-06T16:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-018'], name: 'Karond Junction Road Widening', department: 'PWD', description: 'Road widening and grade separator construction at Karond Junction to ease city-edge traffic.', budget: 35000000, budget_utilized: 0, start_date: '2026-10-01', end_date: '2027-04-30', status: 'DEPT_NOTIFIED', priority: 'HIGH', address: 'Karond Junction, Bhopal', road_name: 'Karond Main Road', progress_percent: 0, assigned_officer: 'Priya Verma', assigned_officer_id: USER_IDS['usr-002'], created_by_id: USER_IDS['usr-002'], lat: 23.3050, lng: 77.3830, created_at: '2026-07-04T10:00:00Z', updated_at: '2026-07-07T09:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-019'], name: 'Bairagarh Water Treatment Plant Expansion', department: 'Water Supply & Sewerage', description: 'Capacity expansion of Bairagarh WTP from 40 MLD to 70 MLD to serve north Bhopal.', budget: 120000000, budget_utilized: 24000000, start_date: '2026-01-01', end_date: '2027-12-31', status: 'IN_PROGRESS', priority: 'CRITICAL', address: 'Bairagarh, Bhopal', road_name: 'Bairagarh Main Road', progress_percent: 20, assigned_officer: 'Sunita Patel', assigned_officer_id: USER_IDS['usr-004'], created_by_id: USER_IDS['usr-004'], lat: 23.2890, lng: 77.3600, created_at: '2025-12-01T09:00:00Z', updated_at: '2026-07-01T09:00:00Z' },
      { id: PROJECT_IDS['PRJ-2025-020'], name: 'MP Nagar Zone-1 Road Patching', department: 'PWD', description: 'Emergency patching of severely damaged road surface in Zone-1 MP Nagar after monsoon damage.', budget: 3200000, budget_utilized: 1600000, start_date: '2026-07-10', end_date: '2026-08-31', status: 'SCHEDULED', priority: 'HIGH', address: 'Zone-1 MP Nagar, Bhopal', road_name: 'Zone-1 Road MP Nagar', progress_percent: 10, assigned_officer: 'Priya Verma', assigned_officer_id: USER_IDS['usr-002'], created_by_id: USER_IDS['usr-002'], lat: 23.2290, lng: 77.4340, created_at: '2026-07-05T09:00:00Z', updated_at: '2026-07-07T09:00:00Z' },
    ];

    // Insert projects using raw SQL to handle the PostGIS geometry column
    for (const p of projects) {
      await queryInterface.sequelize.query(`
        INSERT INTO projects (id, name, department, description, budget, budget_utilized, start_date, end_date, status, priority, address, road_name, progress_percent, assigned_officer, assigned_officer_id, created_by_id, location, created_at, updated_at)
        VALUES (:id, :name, :department, :description, :budget, :budget_utilized, :start_date, :end_date, :status, :priority, :address, :road_name, :progress_percent, :assigned_officer, :assigned_officer_id, :created_by_id, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), :created_at, :updated_at)
      `, {
        replacements: p,
      });
    }

    // ─── 3. CONFLICTS ─────────────────────────────────────────────────────
    await queryInterface.bulkInsert('conflicts', [
      { id: CONFLICT_IDS['CON-001'], conflict_type: 'SAME_ROAD_EXCAVATION', conflict_score: 92, risk_level: 'CRITICAL', status: 'OPEN', departments_involved: JSON.stringify(['PWD', 'Electricity Board', 'Gas Authority']), suggested_actions: JSON.stringify(['Coordinate a joint excavation window — all three departments are cutting Hoshangabad Road within the same 3-month period.', 'PWD should complete road base before Gas Authority lays the PNG pipeline to avoid double excavation.', 'Electricity Board underground cabling trench can share the Gas Authority trench with proper conduit separation.', 'Consider designating a single Coordination Officer across PWD, ELEC and Gas for weekly joint site reviews.']), location_description: 'Hoshangabad Road, Bhopal — 2.3 km overlap detected', road_name: 'Hoshangabad Road', detected_at: '2026-07-01T08:30:00Z', created_at: '2026-07-01T08:30:00Z', updated_at: '2026-07-01T08:30:00Z' },
      { id: CONFLICT_IDS['CON-002'], conflict_type: 'SAME_ROAD_EXCAVATION', conflict_score: 75, risk_level: 'HIGH', status: 'ACKNOWLEDGED', departments_involved: JSON.stringify(['Telecom', 'PWD']), suggested_actions: JSON.stringify(['Telecom fiber trenching in Zone-1 MP Nagar overlaps with PWD emergency patching timeline by ~6 weeks.', 'Delay Telecom trenching by 3 weeks to allow PWD patching to cure — avoids re-excavating fresh patch.', 'Telecom to use micro-trenching technique where patching is complete, minimizing surface disruption.']), location_description: 'Zone-1 Road, MP Nagar — 800m overlap', road_name: 'Zone-1 Road MP Nagar', detected_at: '2026-07-05T10:15:00Z', created_at: '2026-07-05T10:15:00Z', updated_at: '2026-07-05T10:15:00Z' },
      { id: CONFLICT_IDS['CON-003'], conflict_type: 'TIMELINE_OVERLAP', conflict_score: 61, risk_level: 'HIGH', status: 'OPEN', departments_involved: JSON.stringify(['Electricity Board', 'Traffic Police']), suggested_actions: JSON.stringify(['Electricity Board underground cabling and Traffic Police safety upgrade work overlaps in timeline and proximity.', 'Traffic Police works should be sequenced after Electricity Board completes cabling — otherwise traffic safety equipment will be disrupted.', 'Joint traffic management plan needed to handle simultaneous work zones near Hoshangabad–Kolar Road junction.']), location_description: 'Hoshangabad–Kolar Road junction area, Bhopal', road_name: 'Kolar Road', detected_at: '2026-07-03T14:00:00Z', created_at: '2026-07-03T14:00:00Z', updated_at: '2026-07-03T14:00:00Z' },
      { id: CONFLICT_IDS['CON-004'], conflict_type: 'LOCATION_OVERLAP', conflict_score: 45, risk_level: 'MEDIUM', status: 'RESOLVED', departments_involved: JSON.stringify(['PWD', 'Traffic Police']), suggested_actions: JSON.stringify(['New Market flyover repair by PWD and completed traffic signal project by Traffic Police share the same road corridor.', 'Ensure signal equipment is protected during flyover structural work — coordinate with Traffic Police before starting.', 'No active timeline conflict (signal project is complete) — only structural access coordination needed.']), location_description: 'New Market Road, Bhopal', road_name: 'New Market Road', detected_at: '2026-07-01T09:00:00Z', resolved_at: '2026-07-06T15:30:00Z', created_at: '2026-07-01T09:00:00Z', updated_at: '2026-07-06T15:30:00Z' },
      { id: CONFLICT_IDS['CON-005'], conflict_type: 'TIMELINE_OVERLAP', conflict_score: 58, risk_level: 'MEDIUM', status: 'OPEN', departments_involved: JSON.stringify(['Gas Authority', 'Water Supply & Sewerage']), suggested_actions: JSON.stringify(['Gas pipeline laying and sewage upgrade works are planned in overlapping areas near Kolar Road junction.', 'Suggest coordinating trench locations — water and gas lines can be co-laid with prescribed separation distance (300mm min).', 'Align start dates so Water Supply completes trench backfill before Gas Authority excavates adjacent section.']), location_description: 'Hoshangabad Road to Kolar Road link, Bhopal', road_name: 'Kolar Road', detected_at: '2026-07-04T11:00:00Z', created_at: '2026-07-04T11:00:00Z', updated_at: '2026-07-04T11:00:00Z' },
    ]);

    // ─── 4. PROJECT_CONFLICTS (join table) ─────────────────────────────────
    await queryInterface.bulkInsert('project_conflicts', [
      // CON-001: PRJ-001, PRJ-007, PRJ-016
      { project_id: PROJECT_IDS['PRJ-2025-001'], conflict_id: CONFLICT_IDS['CON-001'] },
      { project_id: PROJECT_IDS['PRJ-2025-007'], conflict_id: CONFLICT_IDS['CON-001'] },
      { project_id: PROJECT_IDS['PRJ-2025-016'], conflict_id: CONFLICT_IDS['CON-001'] },
      // CON-002: PRJ-009, PRJ-020
      { project_id: PROJECT_IDS['PRJ-2025-009'], conflict_id: CONFLICT_IDS['CON-002'] },
      { project_id: PROJECT_IDS['PRJ-2025-020'], conflict_id: CONFLICT_IDS['CON-002'] },
      // CON-003: PRJ-007, PRJ-012
      { project_id: PROJECT_IDS['PRJ-2025-007'], conflict_id: CONFLICT_IDS['CON-003'] },
      { project_id: PROJECT_IDS['PRJ-2025-012'], conflict_id: CONFLICT_IDS['CON-003'] },
      // CON-004: PRJ-003, PRJ-011
      { project_id: PROJECT_IDS['PRJ-2025-003'], conflict_id: CONFLICT_IDS['CON-004'] },
      { project_id: PROJECT_IDS['PRJ-2025-011'], conflict_id: CONFLICT_IDS['CON-004'] },
      // CON-005: PRJ-016, PRJ-005
      { project_id: PROJECT_IDS['PRJ-2025-016'], conflict_id: CONFLICT_IDS['CON-005'] },
      { project_id: PROJECT_IDS['PRJ-2025-005'], conflict_id: CONFLICT_IDS['CON-005'] },
    ]);

    // ─── 5. PROJECT TIMELINE (approval history entries) ───────────────────
    const timelineEntries = [
      // PRJ-007 history
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-007'], stage: 'DRAFT', actor: 'Mohan Yadav', action: 'Project created', comment: null, changed_by_id: USER_IDS['usr-001'], created_at: '2026-05-01T09:00:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-007'], stage: 'SUBMITTED', actor: 'Mohan Yadav', action: 'Submitted for review', comment: 'All pre-work documents uploaded.', changed_by_id: USER_IDS['usr-001'], created_at: '2026-06-01T10:00:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-007'], stage: 'CONFLICT_ANALYSIS', actor: 'System', action: 'Conflict detected', comment: 'CON-001, CON-003 detected on Hoshangabad Road.', changed_by_id: null, created_at: '2026-06-02T08:00:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-007'], stage: 'DEPT_NOTIFIED', actor: 'System', action: 'Departments notified', comment: null, changed_by_id: null, created_at: '2026-07-01T09:00:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-007'], stage: 'UNDER_REVIEW', actor: 'Anil Kumar', action: 'Taken for review', comment: null, changed_by_id: USER_IDS['usr-003'], created_at: '2026-07-03T09:00:00Z' },
      // PRJ-008 history
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-008'], stage: 'DRAFT', actor: 'Mohan Yadav', action: 'Project created', comment: null, changed_by_id: USER_IDS['usr-001'], created_at: '2026-07-05T08:00:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-008'], stage: 'SUBMITTED', actor: 'Mohan Yadav', action: 'Submitted for review', comment: 'DPR and environmental clearance attached.', changed_by_id: USER_IDS['usr-001'], created_at: '2026-07-05T09:00:00Z' },
      // PRJ-003 history
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-003'], stage: 'DRAFT', actor: 'Rajan Dubey', action: 'Project created', comment: null, changed_by_id: USER_IDS['usr-001'], created_at: '2026-07-01T08:00:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-003'], stage: 'SUBMITTED', actor: 'Rajan Dubey', action: 'Submitted for review', comment: null, changed_by_id: USER_IDS['usr-001'], created_at: '2026-07-01T09:00:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-003'], stage: 'CONFLICT_ANALYSIS', actor: 'System', action: 'Analysis complete', comment: 'Minor overlap with CON-004 (resolved).', changed_by_id: null, created_at: '2026-07-01T09:05:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-003'], stage: 'DEPT_NOTIFIED', actor: 'System', action: 'Departments notified', comment: null, changed_by_id: null, created_at: '2026-07-02T09:00:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-003'], stage: 'UNDER_REVIEW', actor: 'Anil Kumar', action: 'Taken for review', comment: null, changed_by_id: USER_IDS['usr-003'], created_at: '2026-07-03T10:00:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-003'], stage: 'APPROVED', actor: 'Anil Kumar', action: 'Approved', comment: 'Approved. Structural inspection report verified.', changed_by_id: USER_IDS['usr-003'], created_at: '2026-07-05T14:00:00Z' },
    ];
    await queryInterface.bulkInsert('project_timeline', timelineEntries);

    // ─── 6. APPROVALS ─────────────────────────────────────────────────────
    await queryInterface.bulkInsert('approvals', [
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-007'], status: 'PENDING', submitted_by: USER_IDS['usr-001'], submitted_at: '2026-07-03T09:00:00Z', reviewed_by: null, reviewed_at: null, comment: null, created_at: '2026-07-03T09:00:00Z', updated_at: '2026-07-03T09:00:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-008'], status: 'PENDING', submitted_by: USER_IDS['usr-001'], submitted_at: '2026-07-05T09:00:00Z', reviewed_by: null, reviewed_at: null, comment: null, created_at: '2026-07-05T09:00:00Z', updated_at: '2026-07-05T09:00:00Z' },
      { id: uuidv4(), project_id: PROJECT_IDS['PRJ-2025-003'], status: 'APPROVED', submitted_by: USER_IDS['usr-001'], submitted_at: '2026-07-01T09:00:00Z', reviewed_by: USER_IDS['usr-003'], reviewed_at: '2026-07-05T14:00:00Z', comment: 'Approved. Structural inspection report verified. Ensure traffic diversion plan is communicated to Traffic Police before start.', created_at: '2026-07-01T09:00:00Z', updated_at: '2026-07-05T14:00:00Z' },
    ]);

    // ─── 7. NOTIFICATIONS ─────────────────────────────────────────────────
    await queryInterface.bulkInsert('notifications', [
      { id: NOTIFICATION_IDS['NOT-001'], user_id: null, type: 'CONFLICT_DETECTED', title: 'Critical Conflict: Hoshangabad Road', message: 'Three departments (PWD, Electricity Board, Gas Authority) are planning excavations on Hoshangabad Road within the same period. Conflict score: 92/100.', is_read: false, related_project_id: PROJECT_IDS['PRJ-2025-001'], related_conflict_id: CONFLICT_IDS['CON-001'], recipient_roles: JSON.stringify(['admin', 'approver', 'department_planner']), created_at: '2026-07-01T08:30:00Z' },
      { id: NOTIFICATION_IDS['NOT-002'], user_id: null, type: 'APPROVAL_GRANTED', title: 'Project Approved: New Market Flyover Repair', message: 'PRJ-2025-003 "New Market Flyover Repair" has been approved by the Approver and is now in APPROVED status.', is_read: true, related_project_id: PROJECT_IDS['PRJ-2025-003'], related_conflict_id: null, recipient_roles: JSON.stringify(['admin', 'department_planner']), created_at: '2026-07-05T14:00:00Z' },
      { id: NOTIFICATION_IDS['NOT-003'], user_id: null, type: 'PROJECT_SUBMITTED', title: 'New Project Registered: TT Nagar Substation Upgrade', message: 'PRJ-2025-008 "North TT Nagar Substation Upgrade" has been submitted for review by Electricity Board.', is_read: false, related_project_id: PROJECT_IDS['PRJ-2025-008'], related_conflict_id: null, recipient_roles: JSON.stringify(['admin', 'approver']), created_at: '2026-07-05T09:00:00Z' },
      { id: NOTIFICATION_IDS['NOT-004'], user_id: null, type: 'SYSTEM', title: 'System Maintenance Scheduled', message: 'Planned maintenance window: 2026-07-10 02:00–04:00 IST. Brief service interruption expected.', is_read: true, related_project_id: null, related_conflict_id: null, recipient_roles: JSON.stringify(['admin', 'department_planner', 'approver', 'field_engineer']), created_at: '2026-07-04T10:00:00Z' },
      { id: NOTIFICATION_IDS['NOT-005'], user_id: null, type: 'CONFLICT_DETECTED', title: 'High Conflict: MP Nagar Zone-1 Road', message: 'Telecom fiber trenching and PWD emergency patching overlap on Zone-1 Road MP Nagar. Conflict score: 75/100.', is_read: false, related_project_id: PROJECT_IDS['PRJ-2025-009'], related_conflict_id: CONFLICT_IDS['CON-002'], recipient_roles: JSON.stringify(['admin', 'approver', 'department_planner']), created_at: '2026-07-05T10:15:00Z' },
      { id: NOTIFICATION_IDS['NOT-006'], user_id: null, type: 'PROJECT_UPDATED', title: 'Progress Update: Kolar Road Sewage Upgrade', message: 'PRJ-2025-005 "Kolar Road Sewage Upgrade" progress updated to 30%. Reported by Field Engineer Sunita Patel.', is_read: true, related_project_id: PROJECT_IDS['PRJ-2025-005'], related_conflict_id: null, recipient_roles: JSON.stringify(['admin', 'approver']), created_at: '2026-07-01T10:00:00Z' },
      { id: NOTIFICATION_IDS['NOT-007'], user_id: null, type: 'APPROVAL_GRANTED', title: 'Conflict Resolved: New Market Road', message: 'CON-004 (PWD & Traffic Police overlap at New Market Road) has been marked as Resolved.', is_read: false, related_project_id: null, related_conflict_id: CONFLICT_IDS['CON-004'], recipient_roles: JSON.stringify(['admin', 'approver']), created_at: '2026-07-06T15:30:00Z' },
      { id: NOTIFICATION_IDS['NOT-008'], user_id: null, type: 'PROJECT_SUBMITTED', title: 'New Pending Project: Shahpura PNG Extension', message: 'PRJ-2025-017 "Shahpura PNG Extension" is now in Conflict Analysis. Review required.', is_read: false, related_project_id: PROJECT_IDS['PRJ-2025-017'], related_conflict_id: null, recipient_roles: JSON.stringify(['admin', 'approver']), created_at: '2026-07-06T16:00:00Z' },
    ]);

    // ─── 8. AUDIT LOGS ────────────────────────────────────────────────────
    await queryInterface.bulkInsert('audit_logs', [
      { id: uuidv4(), user_id: USER_IDS['usr-001'], action: 'USER_LOGIN', target_type: 'auth', target_id: null, details: 'Admin logged in from 192.168.1.10', created_at: '2026-07-08T06:00:00Z' },
      { id: uuidv4(), user_id: USER_IDS['usr-003'], action: 'PROJECT_APPROVED', target_type: 'project', target_id: PROJECT_IDS['PRJ-2025-003'], details: 'Approved PRJ-2025-003 New Market Flyover Repair', created_at: '2026-07-05T14:00:00Z' },
      { id: uuidv4(), user_id: USER_IDS['usr-001'], action: 'USER_APPROVED', target_type: 'user', target_id: null, details: 'Admin-created user: Raj Sharma (admin role)', created_at: '2026-07-05T09:00:00Z' },
      { id: uuidv4(), user_id: USER_IDS['usr-002'], action: 'PROJECT_CREATED', target_type: 'project', target_id: PROJECT_IDS['PRJ-2025-020'], details: 'Created project: MP Nagar Zone-1 Road Patching', created_at: '2026-07-05T09:00:00Z' },
      { id: uuidv4(), user_id: USER_IDS['usr-001'], action: 'PROJECT_CREATED', target_type: 'project', target_id: PROJECT_IDS['PRJ-2025-008'], details: 'Created project: North TT Nagar Substation Upgrade', created_at: '2026-07-05T08:00:00Z' },
      { id: uuidv4(), user_id: USER_IDS['usr-003'], action: 'CONFLICT_RESOLVED', target_type: 'conflict', target_id: CONFLICT_IDS['CON-004'], details: 'Resolved conflict CON-004 (New Market Road PWD/Traffic Police)', created_at: '2026-07-06T15:30:00Z' },
      { id: uuidv4(), user_id: USER_IDS['usr-004'], action: 'PROJECT_UPDATED', target_type: 'project', target_id: PROJECT_IDS['PRJ-2025-005'], details: 'Updated progress: 30% on Kolar Road Sewage Upgrade', created_at: '2026-07-01T10:00:00Z' },
      { id: uuidv4(), user_id: USER_IDS['usr-001'], action: 'USER_LOGIN', target_type: 'auth', target_id: null, details: 'Admin logged in from 192.168.1.10', created_at: '2026-07-01T08:00:00Z' },
      { id: uuidv4(), user_id: USER_IDS['usr-002'], action: 'PROJECT_CREATED', target_type: 'project', target_id: PROJECT_IDS['PRJ-2025-018'], details: 'Created project: Karond Junction Road Widening', created_at: '2026-07-04T10:00:00Z' },
      { id: uuidv4(), user_id: USER_IDS['usr-003'], action: 'USER_LOGIN', target_type: 'auth', target_id: null, details: 'Approver logged in from 10.0.0.22', created_at: '2026-07-03T09:00:00Z' },
      { id: uuidv4(), user_id: USER_IDS['usr-002'], action: 'USER_LOGIN', target_type: 'auth', target_id: null, details: 'Planner logged in from 10.0.0.15', created_at: '2026-07-02T08:45:00Z' },
    ]);

    // ─── 9. COMMUNICATION LOGS ────────────────────────────────────────────
    await queryInterface.bulkInsert('communication_logs', [
      { id: uuidv4(), channel: 'EMAIL', recipient: 'priya.verma@pwd.bhopal.gov', subject: '[UDCP Alert] Critical Conflict Detected — Hoshangabad Road', body: 'Dear Priya Verma, A critical scheduling conflict (Score: 92/100) has been detected on Hoshangabad Road involving PWD, Electricity Board, and Gas Authority. Immediate coordination required.', related_notification_id: NOTIFICATION_IDS['NOT-001'], sent_at: '2026-07-01T08:31:00Z' },
      { id: uuidv4(), channel: 'SMS', recipient: '+91-9876543211', subject: 'UDCP Alert', body: '[UDCP] CRITICAL: Hoshangabad Road conflict score 92. 3 departments affected. Login to UDCP for details.', related_notification_id: NOTIFICATION_IDS['NOT-001'], sent_at: '2026-07-01T08:31:05Z' },
      { id: uuidv4(), channel: 'EMAIL', recipient: 'anil.kumar@municipal.bhopal.gov', subject: '[UDCP] Project Approved — New Market Flyover Repair', body: 'Dear Anil Kumar, PRJ-2025-003 "New Market Flyover Repair" has been approved. The project is now in APPROVED status.', related_notification_id: NOTIFICATION_IDS['NOT-002'], sent_at: '2026-07-05T14:01:00Z' },
      { id: uuidv4(), channel: 'EMAIL', recipient: 'admin@udcp.gov', subject: '[UDCP] New Project Registration — TT Nagar Substation Upgrade', body: 'Dear Administrator, A new project PRJ-2025-008 "North TT Nagar Substation Upgrade" has been submitted by Electricity Board.', related_notification_id: NOTIFICATION_IDS['NOT-003'], sent_at: '2026-07-05T09:01:00Z' },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('communication_logs', null, {});
    await queryInterface.bulkDelete('audit_logs', null, {});
    await queryInterface.bulkDelete('notifications', null, {});
    await queryInterface.bulkDelete('approvals', null, {});
    await queryInterface.bulkDelete('project_timeline', null, {});
    await queryInterface.bulkDelete('project_conflicts', null, {});
    await queryInterface.bulkDelete('conflicts', null, {});
    await queryInterface.bulkDelete('projects', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};

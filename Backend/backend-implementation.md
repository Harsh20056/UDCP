# UDCP — Backend Implementation Plan
## Node.js + Express + PostgreSQL/PostGIS

**Context:** You know MERN. This plan keeps everything else identical to what you're used to (Express, JWT, REST, middleware patterns) and changes exactly one thing: MongoDB → PostgreSQL, because the conflict-detection engine needs real spatial queries (PostGIS), not lat/lng stored as two disconnected numbers.

The frontend is already built against a fixed API contract (see `frontend-prompt.md` §API CONTRACT). **This backend must implement that contract exactly** — same routes, same shapes — so you just flip `VITE_USE_MOCK=false` on the frontend and it works.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js + Express | Same as MERN |
| Database | PostgreSQL 16 + PostGIS extension | Native spatial types, `ST_*` functions for conflict detection |
| ORM | Sequelize + `sequelize-cli` | Closest mental model to Mongoose; supports raw SQL escape hatches for PostGIS calls Sequelize doesn't wrap natively |
| Auth | JWT (`jsonwebtoken`) + `bcrypt` | Same as MERN |
| Validation | `zod` (mirrors frontend validation) | Shared mental model with frontend Zod schemas |
| Realtime | Socket.io | Live notification bell, live conflict alerts on the map |
| Email | Nodemailer (dev: Ethereal/console transport) | "Real" channel |
| SMS | Simulated — logged to a `communication_logs` table + console, no real SMS provider needed for prototype | Matches frontend's "Simulated Communications Log" panel |
| File/image uploads | Multer (if project attachments needed later) | Same as MERN |
| Testing | Jest + Supertest | Same as MERN |
| Dev tooling | `nodemon`, `dotenv`, `morgan` | Same as MERN |

---

## 2. Project Setup

```bash
mkdir udcp-backend && cd udcp-backend
npm init -y
npm install express cors helmet morgan dotenv
npm install pg pg-hstore sequelize
npm install -D sequelize-cli nodemon
npm install jsonwebtoken bcrypt zod
npm install socket.io nodemailer
npm install -D jest supertest

npx sequelize-cli init
```

`sequelize-cli init` creates `config/`, `models/`, `migrations/`, `seeders/` — this is your schema versioning system, the thing Mongoose never forced you to have. **Never hand-edit the database schema; always go through a migration file.** This habit matters a lot more in Postgres than Mongo.

### Enable PostGIS (one-time, per database)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```
Run this either via a raw migration (`sequelize-cli migration:generate --name enable-postgis`) or manually in `psql` before your first real migration. It must exist before any migration that creates a `GEOMETRY` column.

---

## 3. Folder Structure

```
udcp-backend/
├── src/
│   ├── server.js                    # entry point, http server + socket.io attach
│   ├── app.js                       # express app, middleware wiring
│   ├── config/
│   │   ├── database.js              # sequelize connection config (reads .env)
│   │   ├── env.js
│   │   └── constants.js             # ROLES, DEPARTMENTS, STATUSES, PRIORITIES — mirror frontend exactly
│   │
│   ├── models/                      # Sequelize models (equivalent to Mongoose schemas)
│   │   ├── index.js                 # loads all models, sets up associations
│   │   ├── user.model.js
│   │   ├── project.model.js
│   │   ├── conflict.model.js
│   │   ├── approval.model.js
│   │   ├── notification.model.js
│   │   ├── communicationLog.model.js
│   │   ├── auditLog.model.js
│   │   └── projectTimeline.model.js
│   │
│   ├── migrations/                  # sequelize-cli managed, one file per schema change
│   ├── seeders/                     # seed data — port your frontend mock data here 1:1
│   │
│   ├── routes/
│   │   ├── index.js                 # mounts all sub-routers
│   │   ├── auth.routes.js
│   │   ├── user.routes.js           # pending-staff approve/reject
│   │   ├── project.routes.js
│   │   ├── conflict.routes.js
│   │   ├── approval.routes.js
│   │   ├── notification.routes.js
│   │   ├── analytics.routes.js
│   │   ├── audit.routes.js
│   │   └── citizen.routes.js
│   │
│   ├── controllers/                 # one per route file, thin — validate + call service + respond
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── project.controller.js
│   │   ├── conflict.controller.js
│   │   ├── approval.controller.js
│   │   ├── notification.controller.js
│   │   ├── analytics.controller.js
│   │   ├── audit.controller.js
│   │   └── citizen.controller.js
│   │
│   ├── services/                    # actual business logic lives here, not in controllers
│   │   ├── auth.service.js
│   │   ├── project.service.js
│   │   ├── conflictDetection.service.js   # the PostGIS-powered engine — the core of the project
│   │   ├── workflow.service.js            # state machine transitions + side effects
│   │   ├── notification.service.js        # creates in-app + triggers email/SMS simulation
│   │   ├── analytics.service.js
│   │   └── audit.service.js
│   │
│   ├── middleware/
│   │   ├── authenticate.js          # verifies JWT, attaches req.user
│   │   ├── authorize.js             # RBAC — permission matrix check, mirrors frontend permissions.js
│   │   ├── validate.js              # zod schema validation wrapper
│   │   ├── errorHandler.js
│   │   └── auditLogger.js           # middleware that auto-writes audit entries on mutating routes
│   │
│   ├── validators/                  # zod schemas, one per resource — should mirror frontend's validators.js
│   │   ├── auth.validator.js
│   │   ├── project.validator.js
│   │   └── ...
│   │
│   ├── sockets/
│   │   └── notificationSocket.js    # emits live notification/conflict events to connected clients
│   │
│   └── utils/
│       ├── geo.js                   # helpers for building GEOMETRY points from lat/lng
│       ├── dateUtils.js
│       ├── tokenUtils.js
│       └── responseFormatter.js     # consistent { success, data, error } envelope
│
├── .env.example
├── .sequelizerc
├── package.json
└── README.md
```

This is structurally almost identical to a well-organized MERN backend — the only new folders are `migrations/` (Sequelize forces schema discipline) and the fact that `services/` does more spatial-query heavy lifting than you're used to.

---

## 4. Database Schema

### `users`
```
id                UUID PK
name              VARCHAR
email             VARCHAR UNIQUE
password_hash     VARCHAR
role              ENUM(admin, department_planner, approver, field_engineer, public_viewer)
department        ENUM(PWD, WATER_SUPPLY, ELECTRICITY, TELECOM, TRAFFIC_POLICE, MUNICIPAL_CORP, GAS)  -- nullable for public_viewer
status            ENUM(ACTIVE, PENDING_APPROVAL, REJECTED)
phone             VARCHAR nullable
created_at, updated_at
```

### `projects`
```
id                UUID PK
name              VARCHAR
department        ENUM (same as above)
description       TEXT
budget            DECIMAL
budget_utilized   DECIMAL DEFAULT 0
start_date        DATE
end_date          DATE
status            ENUM(DRAFT, SUBMITTED, CONFLICT_ANALYSIS, DEPT_NOTIFIED, UNDER_REVIEW,
                        APPROVED, REJECTED, SCHEDULED, IN_PROGRESS, COMPLETED)
priority          ENUM(LOW, MEDIUM, HIGH, CRITICAL)
location          GEOMETRY(POINT, 4326)   -- THE key PostGIS column; 4326 = standard lat/lng SRID
address           VARCHAR
road_name         VARCHAR
assigned_officer_id  UUID FK -> users.id
created_by_id     UUID FK -> users.id
created_at, updated_at
```
Add a **spatial index**: `CREATE INDEX projects_location_idx ON projects USING GIST (location);` — without this, `ST_DWithin` queries do a full table scan. This is the single most important index in the whole database.

### `conflicts`
```
id                    UUID PK
conflict_type         ENUM(LOCATION_OVERLAP, TIMELINE_OVERLAP, SAME_ROAD_EXCAVATION, DUPLICATE_REQUEST)
conflict_score        INTEGER (0-100)
risk_level            ENUM(LOW, MEDIUM, HIGH, CRITICAL)
status                ENUM(OPEN, ACKNOWLEDGED, RESOLVED)
suggested_actions     JSONB   -- array of strings, Postgres native JSON support
detected_at, resolved_at
```

### `project_conflicts` (join table — many-to-many, a conflict can involve 2+ projects)
```
project_id    UUID FK
conflict_id   UUID FK
```

### `project_timeline`
```
id, project_id FK, from_status, to_status, changed_by_id FK, comment, created_at
```

### `approvals`
```
id, project_id FK, approver_id FK, decision ENUM(APPROVED, REJECTED),
comment, created_at
```

### `notifications`
```
id, user_id FK, type ENUM(GENERAL, APPROVAL, CONFLICT, DEADLINE),
title, message, is_read BOOLEAN DEFAULT false, related_project_id FK nullable, created_at
```

### `communication_logs` (the "simulated email/SMS" panel)
```
id, channel ENUM(EMAIL, SMS), recipient, subject, body, related_notification_id FK, sent_at
```

### `audit_logs`
```
id, user_id FK, action VARCHAR, target_type VARCHAR, target_id UUID,
before_state JSONB nullable, after_state JSONB nullable, created_at
```

Every one of these maps directly to a table/list you already designed on the frontend — the audit log's `before_state`/`after_state` JSONB pair is what powers the diff view in the Audit Logs page.

---

## 5. The Conflict Detection Engine (server-side, PostGIS-powered)

This replaces the frontend's client-side JS approximation with real spatial SQL. Lives in `services/conflictDetection.service.js`, triggered whenever a project is created or its location/dates change.

**Location overlap** — two projects within 150 meters:
```sql
SELECT id, name, department, ST_Distance(location::geography, $1::geography) AS distance_m
FROM projects
WHERE id != $2
  AND ST_DWithin(location::geography, $1::geography, 150)
  AND status NOT IN ('COMPLETED', 'REJECTED');
```
`ST_DWithin` on `geography` type gives you real-world meters, not raw coordinate degrees — this is the detail that trips people up first (using `geometry` distance gives you degrees, which is meaningless for "150 meters").

**Timeline overlap** — standard date range intersection, plain SQL:
```sql
WHERE start_date <= $end_date AND end_date >= $start_date
```

**Same-road excavation** — combine `road_name` exact/fuzzy match (`ILIKE` or `pg_trgm` similarity for near-matches) with the timeline overlap check above; weight this combination highest in the score since it's the deck's headline example (one department repaves, another digs it up).

**Scoring** — same 0–100 weighted formula you already designed for the frontend simulation, just now computed server-side against real data instead of the in-memory mock array. Keep the function signature intentionally similar to `conflictScoring.js` from the frontend build so the logic isn't a total rewrite — same inputs (two projects), same output shape (`score`, `riskLevel`, `suggestedActions`).

**When to run it:**
- On project create (status → `SUBMITTED`): run detection, if any conflict found, set status to `CONFLICT_ANALYSIS`, create `conflicts` rows, create notifications for all department planners of the involved departments, log to `communication_logs`.
- On project edit (if location or dates changed): re-run detection.
- Nightly/cron sweep (optional, stretch goal): re-scan all `SUBMITTED`/`UNDER_REVIEW` projects in case a newly approved project creates a conflict with something already in the queue.

---

## 6. Auth & RBAC

Same JWT pattern as MERN: `authenticate.js` verifies the token and attaches `req.user`. The difference is `authorize.js` should be a **direct port of the frontend's `permissions.js` matrix** — literally keep the same action-name strings (`project:create`, `approval:approve`, etc.) on both sides so the two systems never drift apart.

```js
// middleware/authorize.js
const authorize = (action) => (req, res, next) => {
  if (!can(req.user, action, { department: req.body.department })) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  next();
};

// usage in routes:
router.post('/projects', authenticate, authorize('project:create'), projectController.create);
```

**Registration flow** (matches what the frontend already expects):
- `POST /auth/register` with `accountType: 'citizen'` → creates user with `role: public_viewer`, `status: ACTIVE`.
- `POST /auth/register` with `accountType: 'staff'` → creates user with chosen role (never `admin`) and `status: PENDING_APPROVAL`.
- `POST /auth/login` — if `status === 'PENDING_APPROVAL'`, return a distinct response code/flag so frontend routes to the pending-approval page instead of failing the login outright (this matches what you already built on the frontend).
- `GET /users/pending-staff`, `POST /users/:id/approve`, `POST /users/:id/reject` — admin-only, flips `status`.

---

## 7. Workflow / State Machine

`services/workflow.service.js` owns all status transitions for a project:

```
DRAFT → SUBMITTED → CONFLICT_ANALYSIS → DEPT_NOTIFIED → UNDER_REVIEW
  → APPROVED → SCHEDULED → IN_PROGRESS → COMPLETED
  → REJECTED → (back to DRAFT)
```

Every transition, in one function, must (in a single DB transaction — use `sequelize.transaction()`):
1. Update `projects.status`.
2. Insert a `project_timeline` row.
3. Insert an `audit_logs` row.
4. Call `notification.service.js` to create relevant `notifications` + `communication_logs` rows.
5. If the transition is `SUBMITTED → CONFLICT_ANALYSIS`, call the conflict detection service.

Wrapping this in a transaction matters more here than it did in Mongo — Postgres will actually enforce atomicity across these four writes instead of you hoping nothing fails halfway.

---

## 8. Real-time Notifications (Socket.io)

Optional but cheap to add and makes the demo much stronger:
- On server start, attach `socket.io` to the same HTTP server.
- On login, client joins a room named after their `user.id`.
- `notification.service.js`, after inserting a `notifications` row, emits `io.to(userId).emit('notification:new', payload)`.
- Frontend's `NotificationContext` (already built to poll/simulate) can be upgraded to listen on a socket instead — small frontend change, big demo impact (live conflict alert appearing on an Approver's screen while you're presenting).

---

## 9. API Routes (must match frontend contract exactly)

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me

GET    /api/users/pending-staff
POST   /api/users/:id/approve
POST   /api/users/:id/reject

GET    /api/projects            ?department=&status=&priority=&search=&page=
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/timeline

GET    /api/conflicts           ?riskLevel=&department=
GET    /api/conflicts/:id
POST   /api/conflicts/:id/resolve

GET    /api/approvals           ?status=pending
POST   /api/approvals/:projectId/approve
POST   /api/approvals/:projectId/reject
GET    /api/approvals/:projectId/history

GET    /api/notifications
POST   /api/notifications/:id/read
GET    /api/notifications/preferences
PUT    /api/notifications/preferences

GET    /api/analytics/completion-rate
GET    /api/analytics/conflict-trend
GET    /api/analytics/department-performance
GET    /api/analytics/budget-utilization

GET    /api/audit-logs          ?user=&action=&dateFrom=&dateTo=

GET    /api/citizen/projects
POST   /api/citizen/feedback
```

Response envelope — keep it consistent everywhere (`utils/responseFormatter.js`):
```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "total": 42 } }
{ "success": false, "error": { "message": "...", "code": "..." } }
```

---

## 10. Seeding

Port your frontend mock data (`src/api/mock/data/*.js`) into `seeders/` almost verbatim — same ~20 projects across Bhopal localities, same intentional conflicts, same 5 demo users + 2 pending-approval staff accounts, same password (`password123`, now actually bcrypt-hashed). This means your demo credentials and demo scenario **don't change** when you swap from mock frontend to real backend — huge for demo-day confidence, nothing looks different, it's just real now.

```bash
npx sequelize-cli db:seed:all
```

---

## 11. Build Roadmap

### Day 1 — Foundation
- Install Postgres locally (or via Docker — `docker run -e POSTGRES_PASSWORD=... -p 5432:5432 postgis/postgis`, which ships PostGIS pre-installed and saves you an install headache).
- `sequelize-cli init`, connect, enable PostGIS extension.
- Write all migrations (schema from §4). Run `db:migrate`.
- Write all seeders (§10). Run `db:seed:all`.
- Express app skeleton: `app.js`, `server.js`, error handler, CORS, morgan.

### Day 2 — Auth & RBAC
- `auth.service.js`, `auth.controller.js`, `auth.routes.js` — register (both account types), login (incl. pending-approval branch), JWT issuing, `GET /me`.
- `authenticate.js`, `authorize.js` middleware — port the permission matrix from frontend.
- `user.controller.js` — pending-staff list/approve/reject.
- Test all of this with Postman/Insomnia before touching anything else.

### Day 3 — Projects + the Conflict Engine
- Full CRUD on `/projects` with Sequelize models + GEOMETRY column handling (`utils/geo.js` for converting `{lat, lng}` request bodies into `ST_MakePoint` on write, and back to `{lat, lng}` JSON on read).
- `conflictDetection.service.js` — this is the centerpiece; get the `ST_DWithin` + timeline-overlap + same-road logic working and tested against your seeded conflict scenarios before moving on.
- `workflow.service.js` — status transitions, wired to conflict detection on submit.

### Day 4 — Approvals, Notifications, Audit
- Approvals routes + history.
- `notification.service.js` + `communication_logs` writes (simulated email/SMS).
- Socket.io wiring for live notifications.
- `auditLogger.js` middleware auto-capturing before/after state on mutating routes.
- Audit logs routes with filtering.

### Day 5 — Analytics, Citizen, Polish
- Analytics endpoints — these are mostly `GROUP BY` aggregate SQL queries (completion rate, conflict trend by month, department performance, budget utilization). Use raw queries or Sequelize's aggregate functions here rather than pulling everything into JS and computing in-memory.
- Citizen routes (public projects list — read-only, filtered fields only; feedback submission).
- Integration test pass with Supertest against every route in the contract.
- Point the frontend at the real backend: flip `VITE_USE_MOCK=false`, set `VITE_API_BASE_URL`, smoke-test every page end to end.

---

## 12. A Few Postgres/PostGIS Gotchas Worth Knowing Upfront

- **SRID 4326** is the standard "GPS coordinates" spatial reference system — always specify it (`GEOMETRY(POINT, 4326)`), or distance calculations silently give you nonsense.
- Cast to `geography` (not `geometry`) when you want real-world meter distances (`location::geography`) — `geometry` distance is in raw coordinate units, which is not meters.
- Sequelize's built-in GIS support is partial — expect to drop into `sequelize.query()` with raw SQL for anything using `ST_DWithin`, `ST_Distance`, `ST_MakePoint`. That's normal and fine; don't fight the ORM for this part.
- Always create the GIST index on the geometry column, or every conflict-detection query full-scans the table — fine at 20 seed rows, very not fine as this scales.
- Unlike Mongo, adding a column later means writing a migration, not just saving a document with a new field. Get comfortable running `sequelize-cli migration:generate` often — it's cheap and it's the right habit.

---

## 13. Deliverables Checklist

- [ ] PostGIS enabled, spatial index on `projects.location`
- [ ] All migrations + seeders run cleanly from scratch (`db:migrate` + `db:seed:all` on empty DB)
- [ ] Auth: login/register (both account types)/pending-approval flow/JWT/RBAC matching frontend matrix exactly
- [ ] Conflict engine returns real results against seeded overlapping projects (verify the same ~4-5 conflicts you designed for the frontend demo still surface here)
- [ ] Full workflow state machine enforced server-side (frontend should no longer be able to fake a status transition)
- [ ] Every route in the API contract implemented and returns the exact shape the frontend service layer expects
- [ ] Socket.io live notification (at least for conflict alerts + approval decisions)
- [ ] Postman/Insomnia collection covering all routes, committed to the repo
- [ ] `.env.example` with `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CLIENT_URL`
- [ ] README with setup instructions (Docker Postgres/PostGIS one-liner + migrate + seed + run)
- [ ] Full end-to-end smoke test with frontend pointed at real backend (`VITE_USE_MOCK=false`)

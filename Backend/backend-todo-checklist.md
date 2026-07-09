# UDCP Backend — Step-by-Step Build Checklist

Follow this in order. Each step assumes the previous one works before you move on — don't skip ahead if something's broken, Postgres problems compound fast. Check off as you go.

---

## Phase 0 — Confirm the database is ready

- [ ] `SELECT PostGIS_version();` returns a version string inside `udcp_db` (you already did this)
- [ ] Note your Postgres connection details somewhere handy: host (`localhost`), port (`5432`), username (`postgres`), password, database name (`udcp_db`)

---

## Phase 1 — Project Scaffold

- [ ] `mkdir udcp-backend && cd udcp-backend`
- [ ] `npm init -y`
- [ ] Install core deps:
  ```
  npm install express cors helmet morgan dotenv
  npm install pg pg-hstore sequelize
  npm install jsonwebtoken bcrypt zod
  npm install socket.io nodemailer
  npm install -D sequelize-cli nodemon jest supertest
  ```
- [ ] Create `.env` file:
  ```
  PORT=5000
  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/udcp_db
  JWT_SECRET=some-long-random-string
  JWT_EXPIRES_IN=7d
  CLIENT_URL=http://localhost:5173
  NODE_ENV=development
  ```
- [ ] Create `.env.example` (same keys, no real values) and add `.env` to `.gitignore`
- [ ] `npx sequelize-cli init` — creates `config/`, `models/`, `migrations/`, `seeders/`
- [ ] Edit `config/config.json` (or convert to `config/database.js` reading from `.env`) so `sequelize-cli` can connect using `DATABASE_URL`
- [ ] Add to `package.json` scripts:
  ```json
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all",
    "test": "jest"
  }
  ```
- [ ] Sanity check: `npx sequelize-cli db:migrate` runs with zero migrations and doesn't error (proves the connection string works)

---

## Phase 2 — Express Skeleton (no business logic yet)

- [ ] Create `src/app.js` — express app, `cors()`, `helmet()`, `morgan('dev')`, `express.json()`, mount a placeholder `router.get('/health', ...)`
- [ ] Create `src/server.js` — imports `app.js`, creates `http.createServer(app)`, attaches Socket.io, listens on `PORT`
- [ ] Create `src/middleware/errorHandler.js` — centralized error handler, mount it last in `app.js`
- [ ] Create `src/utils/responseFormatter.js` — `{ success, data, error }` envelope helper functions
- [ ] Run `npm run dev`, hit `GET /health` in Postman/browser, confirm you get a response
- [ ] Set up Postman/Insomnia collection now (empty, just the base URL as a variable) — you'll add every route to it as you build

---

## Phase 3 — Database Schema (migrations, not hand-edited SQL)

Build these in this exact order — later ones have foreign keys into earlier ones.

- [ ] Migration: enable PostGIS extension (`CREATE EXTENSION IF NOT EXISTS postgis;`) — do this as a migration even though you already ran it manually, so a fresh clone of the repo can run `db:migrate` from zero and get a working DB
- [ ] Migration + Model: `users` (id UUID, name, email, password_hash, role enum, department enum nullable, status enum, phone, timestamps)
- [ ] Migration + Model: `projects` (all fields from the plan, `location GEOMETRY(POINT, 4326)`, FKs to `users` for `assigned_officer_id` and `created_by_id`)
- [ ] Migration: add GIST spatial index on `projects.location`
- [ ] Migration + Model: `conflicts`
- [ ] Migration: `project_conflicts` join table
- [ ] Migration + Model: `project_timeline`
- [ ] Migration + Model: `approvals`
- [ ] Migration + Model: `notifications`
- [ ] Migration + Model: `communication_logs`
- [ ] Migration + Model: `audit_logs`
- [ ] In `models/index.js`, define all associations (`belongsTo`, `hasMany`, `belongsToMany` for the conflicts join table)
- [ ] `npm run migrate` — confirm all tables appear in pgAdmin with correct columns and types
- [ ] Double check in pgAdmin: `projects.location` column type shows as `geometry`, and the GIST index exists (Indexes tab on the table)

---

## Phase 4 — Seed Data

- [ ] Port your frontend mock data (`src/api/mock/data/*.js`) into `seeders/` — same ~20 Bhopal projects, same 5 demo users (bcrypt-hash `password123` at seed time, don't store plaintext), same 2 pending-approval staff accounts, same intentional overlaps for conflict testing
- [ ] For project `location`, seed using `Sequelize.fn('ST_MakePoint', lng, lat)` wrapped with `ST_SetSRID(..., 4326)` — get this pattern right here since you'll reuse it in the project service later
- [ ] `npm run seed`
- [ ] Verify in pgAdmin: `SELECT name, ST_AsText(location) FROM projects LIMIT 5;` shows real `POINT(lng lat)` values, not nulls

---

## Phase 5 — Auth & RBAC (build and test this fully before anything else)

- [ ] `src/utils/tokenUtils.js` — sign/verify JWT helpers
- [ ] `src/config/constants.js` — ROLES, DEPARTMENTS, STATUSES, PRIORITIES (copy exactly from frontend `constants.js` so they never drift)
- [ ] `src/utils/permissions.js` — port the permission matrix from the frontend, plus `can(user, action, context)` helper
- [ ] `src/services/auth.service.js` — register (citizen + staff branches), login (incl. `PENDING_APPROVAL` handling), `getMe`
- [ ] `src/controllers/auth.controller.js`, `src/routes/auth.routes.js`
- [ ] `src/middleware/authenticate.js` — verifies JWT from `Authorization: Bearer` header, attaches `req.user`
- [ ] `src/middleware/authorize.js` — wraps `can()`, returns 403 on failure
- [ ] Wire routes: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- [ ] `src/controllers/user.controller.js` + routes: `GET /api/users/pending-staff`, `POST /api/users/:id/approve`, `POST /api/users/:id/reject` (admin-only via `authorize`)
- [ ] **Test thoroughly in Postman before moving on:**
  - [ ] Register a citizen → immediately active, can log in
  - [ ] Register staff → `PENDING_APPROVAL`, login returns the pending flag not a token
  - [ ] Log in as seeded admin → approve the pending staff account
  - [ ] Log in as the now-approved staff account → works
  - [ ] Confirm a `department_planner` token gets 403 on an admin-only route

---

## Phase 6 — Projects CRUD

- [ ] `src/utils/geo.js` — helper to convert incoming `{ lat, lng }` into a raw `ST_SetSRID(ST_MakePoint(...))` SQL fragment for writes, and a helper to convert a returned geometry column back into `{ lat, lng }` JSON for API responses
- [ ] `src/services/project.service.js` — create, list (with filters: department/status/priority/search/pagination), getById, update, delete
- [ ] `src/controllers/project.controller.js`, `src/routes/project.routes.js`, `src/validators/project.validator.js` (Zod)
- [ ] Wire all 5 project routes from the contract, gated with `authorize('project:create')` etc. matching the permission matrix
- [ ] Test in Postman: create a project with a real Bhopal lat/lng, fetch it back, confirm `location` round-trips correctly as `{ lat, lng }` in the JSON response

---

## Phase 7 — The Conflict Detection Engine (core feature — give this real time)

- [ ] `src/services/conflictDetection.service.js` — implement:
  - [ ] Location overlap query using `ST_DWithin(location::geography, $point::geography, 150)`
  - [ ] Timeline overlap check (plain date range SQL)
  - [ ] Same-road excavation check (road name match + timeline overlap, weighted highest)
  - [ ] Score combination → `riskLevel` mapping → `suggestedActions` text generation
- [ ] Test this function in isolation first (a quick script or Jest test) against your seeded data — confirm it finds the same ~4-5 conflicts you designed on the frontend
- [ ] `src/services/workflow.service.js` — status transition function wrapped in `sequelize.transaction()`; wire conflict detection to run on `SUBMITTED → CONFLICT_ANALYSIS`
- [ ] `src/controllers/conflict.controller.js`, `src/routes/conflict.routes.js` — `GET /api/conflicts`, `GET /api/conflicts/:id`, `POST /api/conflicts/:id/resolve`
- [ ] Test: create a project that overlaps a seeded one, confirm a conflict row is created and shows up on `GET /api/conflicts`

---

## Phase 8 — Notifications & Communication Log

- [ ] `src/services/notification.service.js` — creates `notifications` rows + corresponding `communication_logs` rows (email/SMS simulated)
- [ ] Wire it into `workflow.service.js` so every status transition notifies the right users
- [ ] `src/sockets/notificationSocket.js` — on connect, join room by `user.id`; emit `notification:new` when one is created
- [ ] `src/controllers/notification.controller.js`, `src/routes/notification.routes.js` — list, mark-read, preferences get/put
- [ ] Test: trigger a status change, confirm a notification appears via `GET /api/notifications` and a socket event fires (test with a quick socket.io-client script or Postman's socket support)

---

## Phase 9 — Approvals & Audit Logs

- [ ] `src/controllers/approval.controller.js`, `src/routes/approval.routes.js` — approve/reject (calls `workflow.service.js`), history
- [ ] `src/middleware/auditLogger.js` — captures before/after state on mutating routes, writes to `audit_logs`
- [ ] Apply `auditLogger` to project, approval, and user-approval routes
- [ ] `src/controllers/audit.controller.js`, `src/routes/audit.routes.js` — filterable list (admin-only)
- [ ] Test: approve a project, confirm an `audit_logs` row exists with correct before/after status

---

## Phase 10 — Analytics & Citizen Routes

- [ ] `src/services/analytics.service.js` — write these as SQL aggregate queries (`GROUP BY`, `COUNT`, `AVG`), not JS loops over fetched rows
- [ ] Routes: completion-rate, conflict-trend, department-performance, budget-utilization
- [ ] `src/controllers/citizen.controller.js`, `src/routes/citizen.routes.js` — public projects list (no auth required, filtered fields only), feedback submission
- [ ] Test each analytics endpoint returns sensible numbers against your seeded data

---

## Phase 11 — Wire It to the Real Frontend

- [ ] In the frontend `.env`, set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=http://localhost:5000/api`
- [ ] Start both servers, log in through the actual UI as each of the 5 demo roles
- [ ] Click through every page — Dashboard, Projects, Map, Conflicts, Approvals, Notifications, Analytics, Audit Logs, Citizen Portal
- [ ] Fix any response-shape mismatches you find (this is normal — some field naming drift between mock and real is expected on the first pass)

---

## Phase 12 — Final Polish

- [ ] Run `npm run migrate` + `npm run seed` on a **fresh** database from scratch to confirm the whole thing is reproducible (this is what saves you on demo day if something breaks and you need to reset fast)
- [ ] Export your Postman collection and commit it to the repo
- [ ] Write the backend `README.md`: setup steps, `.env` variables, how to migrate/seed/run
- [ ] Double check `.env` is gitignored and no secrets are committed

---

## What to do right now

Start Phase 1. Don't try to build multiple phases in parallel — the sequencing here (schema → seed → auth → CRUD → conflict engine → everything else) exists because each phase's tests depend on the previous one actually working. If you get stuck on any single step, come back and I'll help you debug it directly.

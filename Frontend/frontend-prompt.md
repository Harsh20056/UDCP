# FRONTEND BUILD PROMPT — UDCP (Unified Department Coordination Platform)
> Paste this whole prompt into Antigravity / Kiro as the task. It is self-contained.

---

## ROLE

You are building the **frontend-only prototype** of **UDCP (Unified Department Coordination Platform)** — a government smart-city web application that lets municipal departments (PWD, Water Supply & Sewerage, Electricity Board, Telecom, Traffic Police, Municipal Corporation, Gas Authority) coordinate infrastructure projects, detect scheduling/location conflicts before digging starts, run structured approval workflows, and expose a public citizen portal for transparency.

There is **no backend yet**. You must build a complete, realistic **mock data + mock API layer** using `axios-mock-adapter` so the entire app is fully functional, demoable, and looks production-real, while being architected so a real backend can be swapped in later by changing one env flag — **not by rewriting any component.**

Do not build placeholder/lorem-ipsum screens. Every page must work end-to-end against the mock layer: create a project, watch it get flagged for conflicts, approve it, see it show up on the map and in analytics.

---

## PROJECT SETUP (use npm, not pnpm/yarn)

```bash
npm create vite@latest udcp-frontend -- --template react
cd udcp-frontend
npm install
npm install react-router-dom axios axios-mock-adapter
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install framer-motion leaflet react-leaflet leaflet.markercluster recharts
npm install react-hook-form zod @hookform/resolvers
npm install lucide-react clsx tailwind-merge
npx shadcn@latest init
```
Commit `package-lock.json`. Document these exact commands in `README.md`.

---

## TECH STACK (mandatory, do not substitute)

- React 18 + Vite, JavaScript (JSX, not TypeScript)
- React Router v6 using `createBrowserRouter` (data routing)
- Axios, single instance, with `axios-mock-adapter` for the mock layer
- Tailwind CSS
- shadcn/ui components (generate into `src/components/ui`)
- Framer Motion for all transitions/animations
- Leaflet + react-leaflet + OpenStreetMap tiles + leaflet.markercluster for the GIS map
- Recharts for all charts
- React Hook Form + Zod for forms/validation
- lucide-react for icons
- Context API + hooks for state (no Redux, no Zustand)

---

## ROLES & PERMISSIONS (implement exactly)

Roles: `admin`, `department_planner`, `approver`, `field_engineer`, `public_viewer`

**Account status field** (on the user model): `ACTIVE` | `PENDING_APPROVAL` | `REJECTED`. Every user object is `{ id, name, email, password, role, department, status, createdAt }`.

| Action | admin | department_planner | approver | field_engineer | public_viewer |
|---|---|---|---|---|---|
| View full dashboard | yes | dept-scoped | yes | assigned-only | no |
| Create project | yes | yes (own dept) | no | no | no |
| Edit project | yes | yes (own dept, pre-approval only) | no | yes (status/progress fields only) | no |
| Delete project | yes | yes (own, draft status only) | no | no | no |
| View GIS map | yes | yes | yes | yes | yes (public layer only, no edit) |
| Approve/Reject project | yes | no | yes | no | no |
| View conflicts | yes | dept-scoped | yes | assigned-only | no |
| Manage users | yes | no | no | no | no |
| View audit logs | yes | no | no | no | no |
| View analytics | full | dept-scoped | full | no | no |
| Submit citizen feedback | no | no | no | no | yes |

Build `src/utils/permissions.js` as a single exported permission matrix object plus a `can(user, action, resourceContext)` helper function. Every protected route AND every conditionally-rendered button/action must go through this helper — do not hardcode role checks inline in components.

---

## DEPARTMENTS (enum, use consistently — same colors everywhere: map markers, tags, charts)

PWD, Water Supply & Sewerage, Electricity Board, Telecom, Traffic Police, Municipal Corporation, Gas Authority — each assigned a distinct, accessible color defined once in `src/config/constants.js`.

---

## REGISTRATION FLOW

The Register page offers two account types via a toggle/tabs at the top:

1. **"Citizen"** — name, email, password only. Role is set to `public_viewer`, status `ACTIVE` immediately, redirected straight to `/citizen` after signup.
2. **"Department Staff"** — name, email, password, a role select limited to `department_planner` / `approver` / `field_engineer` (never `admin` — admin accounts are seeded only and are never offered as a registration option, for demo security), and a department select. On submit, the account is created with status `PENDING_APPROVAL`. The user is shown a confirmation screen ("Your account is pending Admin approval") and cannot log in successfully until an Admin approves them.

If a `PENDING_APPROVAL` user attempts login, authenticate the credentials correctly but redirect to a `/pending-approval` holding page instead of the dashboard — do not silently fail the login.

Build a **"Pending Staff Approvals"** widget/section, visible to Admin only (place it in Settings page, or as a Dashboard widget for Admin), listing all `PENDING_APPROVAL` users with Approve / Reject actions. Approve flips status to `ACTIVE` (user can now log in); Reject flips to `REJECTED` and removes them from the pending queue. This reuses the same card/list/action pattern as the Approvals module for projects, so keep the visual language consistent between "approving a project" and "approving a staff account."

Seed the mock user set with a couple of `PENDING_APPROVAL` staff accounts by default so this workflow has something to demo on first load, in addition to the 5 active demo accounts (one per role) with visible credentials on the Login page.

---

## PROJECT DATA MODEL

```js
{
  id, name, department, description,
  budget, budgetUtilized,
  startDate, endDate,
  status, // DRAFT | SUBMITTED | CONFLICT_ANALYSIS | DEPT_NOTIFIED | UNDER_REVIEW | APPROVED | REJECTED | SCHEDULED | IN_PROGRESS | COMPLETED
  priority, // LOW | MEDIUM | HIGH | CRITICAL
  location: { lat, lng, address, roadName },
  assignedOfficer,
  createdBy, createdAt, updatedAt,
  conflictIds: [] // populated by the conflict engine
}
```

## CONFLICT DATA MODEL

```js
{
  id, involvedProjectIds: [],
  conflictType, // LOCATION_OVERLAP | TIMELINE_OVERLAP | SAME_ROAD_EXCAVATION | DUPLICATE_REQUEST
  conflictScore, // 0-100
  riskLevel, // LOW | MEDIUM | HIGH | CRITICAL
  departmentsInvolved: [],
  suggestedActions: [], // rule-based text
  status, // OPEN | ACKNOWLEDGED | RESOLVED
  detectedAt
}
```

## PROJECT LIFECYCLE STATE MACHINE

```
DRAFT -> SUBMITTED -> CONFLICT_ANALYSIS -> DEPT_NOTIFIED -> UNDER_REVIEW
  -> APPROVED -> SCHEDULED -> IN_PROGRESS -> COMPLETED
  -> REJECTED -> (back to DRAFT for revision)
```
Every transition must: append a timeline entry, create an audit log entry, create a notification for relevant users. Build this as `src/utils/conflictScoring.js` + a workflow transition helper so the mock services call the same logic a real backend would.

---

## CONFLICT DETECTION ENGINE (client-side simulation — this is the centerpiece feature, make it feel real)

Implement `src/utils/conflictScoring.js` that runs whenever a project is created or edited against the current in-memory project list:

1. **Location overlap** — haversine distance between two projects' lat/lng under a threshold (e.g. 150m) = potential same-corridor conflict.
2. **Timeline overlap** — date range intersection between two projects.
3. **Same-road excavation** — if `roadName` matches another project's `roadName` and date ranges overlap, flag as `SAME_ROAD_EXCAVATION` with elevated score.
4. **Duplicate request** — near-identical project name/description/location from a different department in overlapping window.

Combine signals into a 0–100 `conflictScore`, map to `riskLevel` (Low <30, Medium 30–60, High 60–85, Critical 85+), and generate 2–4 `suggestedActions` from rule-based templates (e.g. "Coordinate excavation windows with {dept} — their project on {road} runs {dates}", "Consider joint trenching to avoid duplicate excavation costs").

This must run live in the demo: creating a project that overlaps an existing mock project should immediately surface a conflict on the Conflicts page and the map.

---

## MOCK DATA REQUIREMENTS

Seed realistic data in `src/api/mock/data/`:
- **~20 projects** across all 7 departments, varied statuses across the full lifecycle, varied priorities, real-looking Indian road/locality names (this is piloted in Bhopal, Madhya Pradesh — use Bhopal locality names: Arera Colony, MP Nagar, New Market, Kolar Road, Hoshangabad Road, Bittan Market, etc. with roughly correct Bhopal-area lat/lng so the map looks right — center the map around Bhopal, 23.2599° N, 77.4126° E).
- **At least 4–5 intentional conflicts** (overlapping locations/timelines/same-road) so the conflict engine has something to detect on load.
- **5 mock users**, one per role, with a clearly documented password (e.g. all `password123`) so judges can log in live as each role from the login screen.
- **Notifications** tied to real project events.
- **Audit log entries** tied to real actions.

Set up `axios-mock-adapter` in `src/api/mock/mockAdapter.js` with 300–800ms simulated latency per request and occasional (toggleable, off by default) simulated error responses to prove error states are handled.

---

## PAGES TO BUILD (all of them, fully functional)

**Public:** Landing Page, Login, Register (citizen + department staff self-registration, with staff going into a pending-approval state as described above), Forgot Password, Pending Approval holding page.

**Staff app (behind DashboardLayout with Sidebar + Topbar + NotificationBell):**
- Dashboard — KPI cards (active projects, pending approvals, conflicts detected, department activity), project status distribution chart, recent activity feed, recent notifications. Numbers animate in (count-up).
- Projects List — filterable/searchable table (department, status, priority), department color tags, status badges.
- Project Details — full info, timeline, location on mini-map, conflict panel if flagged, edit/delete actions gated by RBAC.
- Create/Edit Project — form with all fields incl. lat/lng picker (click on embedded Leaflet map to set location), validated with Zod, runs conflict check on submit and shows results before final confirm.
- GIS Map — full-screen interactive Leaflet map, all projects as markers colored by department, marker clustering, click marker → slide-in details drawer, layer toggle (by department, by status, by risk), simple zone-drawing tool for marking a project's work area.
- Conflicts List — cards/table with risk level, score gauge, departments involved.
- Conflict Details — full breakdown, suggested actions, resolve action (Approver/Admin only).
- Approvals — queue of projects pending review (Approver/Admin), workflow stepper component showing current stage, approve/reject with required comment.
- Notifications — full list, mark as read, filter by type, a visible "Simulated Email/SMS Log" panel showing what would have been sent (subject/body preview) — this demonstrates the notification requirement without a real backend.
- Analytics — completion rate, conflict reduction trend (line chart), department performance (bar chart), budget utilization, infrastructure coverage — all Recharts, dept-scoped for Planner role.
- Audit Logs — Admin only, filterable table of user actions, project changes, approval history, login activity.
- Settings — profile, notification preferences, dark mode toggle.

**Citizen Portal (separate CitizenLayout, public-friendly, mobile-first):**
- Citizen Portal home — ongoing projects list, road closures highlighted, project status, simple map view.
- Citizen Project Details — read-only.
- Feedback form — submit feedback tied to a project or general.

**Error pages:** 404, Unauthorized (shown when a role tries to access a route it lacks permission for, with a clear message and link back).

---

## DESIGN REQUIREMENTS

This must look like a **real government smart-city platform / enterprise SaaS product**, not a hackathon template:
- Deep civic blue primary palette, slate neutrals, semantic status colors (green/amber/red/blue), consistent department color-coding everywhere.
- Clean cards (rounded-xl, soft shadow, subtle border), tiered background (page bg slightly off-white/slate, cards white).
- Full dark mode support via Tailwind class strategy, toggled and persisted.
- Framer Motion: page transitions, list stagger-in, modal/drawer springs, KPI count-up, conflict score gauge animating on load. Keep it snappy (150–300ms), not showy.
- Fully responsive — the citizen portal especially must work well on mobile.
- Every list/table has loading skeleton, empty state, and error state — do not leave any data view without these three states handled.
- Accessible: keyboard navigable, status never conveyed by color alone (pair with icon/text).

---

## ARCHITECTURE RULES (non-negotiable)

1. **No component calls axios directly.** All data access goes through `src/api/services/*.js` functions, which call the shared `axiosInstance`. This is what lets the mock→real backend swap be a one-line env change tomorrow.
2. **RBAC is centralized** in `src/utils/permissions.js`. No inline `if (user.role === 'admin')` scattered through components.
3. **Route guards:** `ProtectedRoute` (auth check) wraps `RoleBasedRoute` (permission check) wraps the actual page.
4. **Design tokens** (colors, department color map, spacing) live in `src/config/constants.js` and `tailwind.config.js` — not hardcoded hex values inside components.
5. Use the exact folder structure below. Do not flatten it or invent a different structure.

```
src/
├── main.jsx, App.jsx, index.css
├── config/            (env.js, constants.js, navigation.js)
├── api/
│   ├── axiosInstance.js, endpoints.js
│   ├── services/       (authService, userService, projectService, conflictService, approvalService,
│   │                     notificationService, analyticsService, auditService, citizenService)
│   └── mock/
│       ├── mockAdapter.js
│       └── data/        (users.js, projects.js, conflicts.js, notifications.js, approvals.js, auditLogs.js)
├── routes/             (AppRoutes.jsx, ProtectedRoute.jsx, RoleBasedRoute.jsx, routeConfig.js)
├── context/            (AuthContext, ThemeContext, NotificationContext, ProjectContext)
├── hooks/              (useAuth, usePermission, useNotifications, useConflicts, useDebounce, useMediaQuery)
├── layouts/
│   ├── AuthLayout.jsx, DashboardLayout.jsx, CitizenLayout.jsx
│   └── components/      (Sidebar, Topbar, NotificationBell, Footer)
├── components/
│   ├── ui/               (shadcn primitives)
│   ├── common/            (StatusBadge, PriorityTag, DepartmentTag, EmptyState, LoadingSpinner,
│   │                       ConfirmDialog, DataTable, PageHeader)
│   ├── charts/            (ProjectStatusPie, DepartmentBarChart, ConflictTrendLine,
│   │                       BudgetUtilizationChart, CompletionRateChart)
│   ├── map/               (CityMap, ProjectMarker, MarkerClusterLayer, ConflictZoneOverlay,
│   │                       MapLayerControl, DrawZoneTool)
│   ├── projects/          (ProjectForm, ProjectCard, ProjectTable, ProjectTimeline, ProjectFilters)
│   ├── conflicts/         (ConflictCard, ConflictScoreGauge, ConflictDetailsPanel, SuggestedActionsList)
│   ├── approvals/         (ApprovalWorkflowStepper, ApprovalCard, ApprovalHistoryTimeline)
│   ├── notifications/     (NotificationList, NotificationItem, NotificationPreferences)
│   └── audit/             (AuditLogTable, AuditFilterBar)
├── pages/
│   ├── public/            (LandingPage, LoginPage, RegisterPage, ForgotPasswordPage, PendingApprovalPage)
│   ├── dashboard/          (DashboardPage)
│   ├── projects/           (ProjectsListPage, ProjectDetailsPage, CreateProjectPage, EditProjectPage)
│   ├── map/                (GISMapPage)
│   ├── conflicts/          (ConflictsListPage, ConflictDetailsPage)
│   ├── approvals/          (ApprovalsPage)
│   ├── notifications/      (NotificationsPage)
│   ├── analytics/          (AnalyticsPage)
│   ├── audit/              (AuditLogsPage)
│   ├── citizen/            (CitizenPortalPage, CitizenProjectDetailsPage, FeedbackFormPage)
│   ├── settings/           (SettingsPage)
│   └── error/              (NotFoundPage, UnauthorizedPage)
├── utils/              (dateUtils, formatters, validators, conflictScoring, geoUtils, permissions)
├── styles/             (theme.js)
└── lib/                (utils.js — shadcn cn() helper)
```

---

## API CONTRACT (mock now, real backend implements identically later)

```
POST   /auth/login              POST /auth/register        POST /auth/forgot-password
POST   /auth/reset-password     GET  /auth/me

GET    /users/pending-staff                        POST /users/:id/approve
POST   /users/:id/reject

GET    /projects  ?department=&status=&priority=&search=&page=
POST   /projects                GET  /projects/:id
PUT    /projects/:id            DELETE /projects/:id       GET /projects/:id/timeline

GET    /conflicts ?riskLevel=&department=       GET /conflicts/:id
POST   /conflicts/:id/resolve

GET    /approvals ?status=pending
POST   /approvals/:projectId/approve            POST /approvals/:projectId/reject
GET    /approvals/:projectId/history

GET    /notifications                            POST /notifications/:id/read
GET    /notifications/preferences                 PUT  /notifications/preferences

GET    /analytics/completion-rate                 GET /analytics/conflict-trend
GET    /analytics/department-performance          GET /analytics/budget-utilization

GET    /audit-logs ?user=&action=&dateFrom=&dateTo=

GET    /citizen/projects                          POST /citizen/feedback
```
Define all of these as constants in `src/api/endpoints.js` and mock every single one in `mockAdapter.js` — no route in this contract should be left unmocked.

---

## ENV CONFIG

Create `.env.example` with:
```
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```
`src/config/env.js` reads these; `axiosInstance.js` and `mockAdapter.js` both respect `VITE_USE_MOCK` — when `false`, the mock adapter is not installed and axios hits `VITE_API_BASE_URL` directly.

---

## BUILD ORDER (follow this sequence)

1. Scaffold: Vite + Tailwind + shadcn init + Framer Motion + React Router + folder structure above (all empty files/folders created first).
2. `config/`, `api/axiosInstance.js`, full mock data set, `mockAdapter.js` wired to every endpoint in the contract.
3. `AuthContext`, `ProtectedRoute`, `RoleBasedRoute`, `permissions.js`, `navigation.js`.
4. Layouts: `AuthLayout`, `DashboardLayout` (Sidebar/Topbar/NotificationBell), `CitizenLayout`.
5. Public pages: Landing, Login (with visible demo credentials for all 5 roles), Register, Forgot Password.
6. Dashboard page with real charts wired to mock analytics.
7. Projects module: list, details, create/edit form with map location picker, conflict check on submit.
8. Conflict engine (`conflictScoring.js`) + Conflicts pages, wired to actually run against mock projects on load.
9. GIS Map page with clustering, department colors, click-to-detail, layer controls.
10. Approvals module with workflow stepper.
11. Notifications center + simulated email/SMS log panel.
12. Analytics page, Audit Logs page, Settings page.
13. Citizen Portal (3 pages).
14. Error pages, dark mode pass, responsive pass, animation pass, loading/empty/error states audit across every data view.

Build and verify each numbered step works before moving to the next — don't scaffold all pages empty first and fill later; make each page real as you build it.

---

## ACCEPTANCE CRITERIA

- App runs with `npm run dev`, no console errors.
- Login works for all 5 seeded active demo users, each redirected appropriately and seeing only what their role permits.
- A new "Department Staff" registration lands the user in `PENDING_APPROVAL` and blocks dashboard access until an Admin approves them from the Pending Staff Approvals panel; a new "Citizen" registration is active immediately.
- Creating a project that overlaps an existing mock project immediately produces a visible conflict with score and suggested actions.
- GIS map renders Bhopal-centered, clustered, color-coded markers; clicking one opens correct project details.
- Approving a project moves it through the full state machine and the change is reflected on Dashboard, Analytics, and Audit Logs.
- Citizen Portal is publicly viewable without login, read-only, and mobile-responsive.
- Dark mode works across every page, not just some.
- Every table/list has working loading, empty, and error states.

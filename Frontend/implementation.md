# UDCP — Unified Department Coordination Platform
## Frontend Implementation Plan (IDS 2026 — Round 2 Prototype)

**Team:** Error404
**Problem Statement:** PS-2 — Missing Inter-Departmental Coordination in Urban Infrastructure Projects
**Tagline:** "One City, One Platform, One Plan."

---

## 1. Context Recap (from the Round 1 deck)

UDCP is a centralized digital coordination platform where departments — PWD, Water, Electricity, Telecom, Traffic Police, Municipal Corporation — share project schedules and dig-up plans in real time to prevent conflicts (e.g. one department digging a road right after another repaved it).

Core pillars defined in the deck:
- **Centralized Project Management** — unified timeline/schedule repository, permissioned per department.
- **Real-time Communication & Approval Workflows** — in-platform messaging, structured approvals, audit trails.
- **GIS-based Mapping & Conflict Detection** — spatial overlays, automatic detection of overlapping work.
- **Automated Notifications & Monitoring** — event-driven alerts, public-facing status updates.

**Defined roles:** Admin, Department Planner, Approver, Field Engineer, Public Viewer (citizen, read-only).

**Defined workflow:**
`Submit Project → Conflict Analysis → Notify Departments → Approver Review → Approve/Reject → Schedule → Execute`

Everything below is built to match this — not a generic CRUD dashboard.

---

## 2. Round-2 Strategy: Why Frontend-First

You're building the prototype in two phases:
- **Phase A (today/this week):** Frontend only, fully clickable, fully wired to a **mock data layer** that mimics real API responses (delays, structure, pagination) so the UI never looks fake in a demo.
- **Phase B (from tomorrow):** Node.js/Express + PostgreSQL+PostGIS backend. Because the frontend talks to a single `axios` instance with a swappable base URL and a mock adapter, you flip **one flag** (`VITE_USE_MOCK=false`) and the real backend takes over — no component rewrites needed.

This is the single most important architectural decision: **every page fetches data through a service function, never directly through axios or inline mock JSON.** That's what makes the swap painless tomorrow.

---

## 3. Project Setup

Use **Vite + npm** (not pnpm/yarn) for the frontend so setup is friction-free for anyone else on the team pulling the repo:

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
npm run dev
```

Commit a `package-lock.json`. Document all of the above verbatim in the project `README.md` so the backend teammate (or future you) can get the frontend running in one pass.

---

## 4. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | JavaScript (JSX) |
| Routing | React Router v6 (data routing / `createBrowserRouter`) |
| HTTP | Axios (single instance + interceptors) |
| Styling | Tailwind CSS |
| Component Library | shadcn/ui (Radix-based, copied into `components/ui`) |
| Animation | Framer Motion |
| Maps | Leaflet + React-Leaflet + OpenStreetMap tiles + Leaflet.markercluster |
| Charts | Recharts |
| Auth | Context-based RBAC (mocked JWT now, real JWT from backend later) |
| Notifications | In-app (Context + toast), Email/SMS simulated via mock service with visible "simulated" log panel |
| Forms | React Hook Form + Zod (validation) |
| State | React Context + hooks (no Redux needed at this scale) |
| Icons | lucide-react |

---

## 5. Roles & Permission Matrix

| Capability | Admin | Department Planner | Approver | Field Engineer | Public Viewer |
|---|---|---|---|---|---|
| View dashboard (full) | ✅ | ✅ (own dept scoped) | ✅ | ✅ (assigned only) | ❌ |
| Create project | ✅ | ✅ (own dept) | ❌ | ❌ | ❌ |
| Edit project | ✅ | ✅ (own dept, pre-approval) | ❌ | ✅ (status/progress fields only) | ❌ |
| Delete project | ✅ | ✅ (own, draft only) | ❌ | ❌ | ❌ |
| View GIS map | ✅ | ✅ | ✅ | ✅ | ✅ (public layer only) |
| Approve/Reject | ✅ | ❌ | ✅ | ❌ | ❌ |
| View conflicts | ✅ | ✅ (own dept) | ✅ | ✅ (assigned) | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Analytics (full) | ✅ | ❌ (dept-only view) | ✅ | ❌ | ❌ |
| Submit citizen feedback | ❌ | ❌ | ❌ | ❌ | ✅ |

This matrix becomes `src/utils/permissions.js` — a single source of truth consumed by `RoleBasedRoute` and by conditional UI rendering (`can(user, 'project:create')`).

**Departments (enum):** PWD, Water Supply & Sewerage, Electricity Board, Telecom, Traffic Police, Municipal Corporation, Gas Authority.

---

## 6. Application Flow

### 5.1 Auth Flow
```
Landing Page ─┬─> Login ──> role resolved from mock user store ──> redirect:
              │                Admin/Planner/Approver/Field Engineer -> /dashboard
              │                Public Viewer                          -> /citizen
              │                Staff account PENDING_APPROVAL         -> /pending-approval (blocked)
              └─> Register ──> choose account type:
                       ├─ "Citizen" -> role = Public Viewer, active immediately -> /citizen
                       └─ "Department Staff" -> pick role (Planner / Approver / Field Engineer)
                                                  + department -> account created as
                                                  PENDING_APPROVAL -> Admin must approve
                                                  from Settings/User Management before login works.
                       Admin accounts are NEVER self-registered — seeded only, for demo security.
Forgot Password -> mock OTP/email simulation -> Reset -> Login
```
Session persisted via Context + localStorage token (mock JWT-like object: `{ token, role, department, name, status, exp }`). `ProtectedRoute` checks token presence + expiry; `RoleBasedRoute` checks the permission matrix. A `status !== 'ACTIVE'` staff account is redirected to a simple "Pending Approval" holding page instead of the dashboard.

This gives Admin a real workflow to demonstrate: a **"Pending Staff Approvals"** panel (add to Settings page or a small widget on Dashboard for Admin) listing self-registered staff awaiting activation, with Approve/Reject actions — mirroring the same approval pattern used for projects, so the UI language stays consistent.

### 5.2 Core Navigation Flow (staff)
```
Dashboard ─┬─> Projects ─> Project Details ─┬─> Edit
           │                                 ├─> Timeline
           │                                 └─> Conflict panel (if any)
           ├─> GIS Map ─> click marker -> Project Details drawer
           ├─> Conflicts ─> Conflict Details ─> Suggested Actions -> (Approver) Resolve
           ├─> Approvals ─> Approval Workflow Stepper -> Approve/Reject -> logs to Audit
           ├─> Notifications ─> mark read / preferences
           ├─> Analytics
           ├─> Audit Logs (Admin only)
           └─> Settings (profile, notification prefs, dept info)
```

### 5.3 Project Lifecycle (state machine — drives the Approval Workflow Stepper UI)
```
DRAFT → SUBMITTED → CONFLICT_ANALYSIS → DEPT_NOTIFIED → UNDER_REVIEW
   → (APPROVED → SCHEDULED → IN_PROGRESS → COMPLETED)
   → (REJECTED → back to DRAFT for revision)
```
Every transition writes an Audit Log entry and triggers a Notification (in-app + simulated email/SMS row) — this is mocked in Phase A but the exact same call shape backend will implement in Phase B.

### 5.4 Conflict Detection (frontend simulation for the prototype)
Since there's no backend yet, `src/utils/conflictScoring.js` implements a **client-side simulation** of the real engine described in the deck, so the demo shows live conflict detection:
- Same-road / overlapping lat-lng radius check (haversine distance under threshold).
- Overlapping date ranges (start/end interval overlap).
- Same-corridor different-department flag.
- Produces a `conflictScore` (0–100), `riskLevel` (Low/Medium/High/Critical), `departmentsInvolved`, and `suggestedActions` (rule-based text templates).

This function is called against the mock project dataset whenever a project is created/edited, so judges see the conflict engine "work" live. When the real backend conflict engine ships, this file's function signature is what the service layer calls — same input/output contract — so swapping is trivial.

---

## 7. Folder Structure

```
udcp-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   │
│   ├── config/
│   │   ├── env.js                    # reads VITE_ env vars, exposes USE_MOCK flag
│   │   ├── constants.js              # ROLES, DEPARTMENTS, STATUSES, PRIORITIES enums
│   │   └── navigation.js             # role -> nav items config (drives Sidebar)
│   │
│   ├── api/
│   │   ├── axiosInstance.js          # single axios instance, interceptors (auth header, error toast)
│   │   ├── endpoints.js              # all REST paths as constants
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── projectService.js
│   │   │   ├── conflictService.js
│   │   │   ├── approvalService.js
│   │   │   ├── notificationService.js
│   │   │   ├── analyticsService.js
│   │   │   ├── auditService.js
│   │   │   └── citizenService.js
│   │   └── mock/
│   │       ├── mockAdapter.js        # axios-mock-adapter wiring, latency simulation
│   │       └── data/
│   │           ├── users.js
│   │           ├── projects.js
│   │           ├── conflicts.js
│   │           ├── notifications.js
│   │           ├── approvals.js
│   │           └── auditLogs.js
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx             # createBrowserRouter tree
│   │   ├── ProtectedRoute.jsx        # auth guard
│   │   ├── RoleBasedRoute.jsx        # permission guard
│   │   └── routeConfig.js            # path constants
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx          # dark mode
│   │   ├── NotificationContext.jsx   # in-app notification bell state
│   │   └── ProjectContext.jsx        # shared project list cache
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── usePermission.js
│   │   ├── useNotifications.js
│   │   ├── useConflicts.js
│   │   ├── useDebounce.js
│   │   └── useMediaQuery.js
│   │
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── CitizenLayout.jsx
│   │   └── components/
│   │       ├── Sidebar.jsx
│   │       ├── Topbar.jsx
│   │       ├── NotificationBell.jsx
│   │       └── Footer.jsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn primitives: button, card, dialog, input, select,
│   │   │                             # table, tabs, badge, dropdown-menu, toast, skeleton, avatar
│   │   ├── common/
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── PriorityTag.jsx
│   │   │   ├── DepartmentTag.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── DataTable.jsx
│   │   │   └── PageHeader.jsx
│   │   ├── charts/
│   │   │   ├── ProjectStatusPie.jsx
│   │   │   ├── DepartmentBarChart.jsx
│   │   │   ├── ConflictTrendLine.jsx
│   │   │   ├── BudgetUtilizationChart.jsx
│   │   │   └── CompletionRateChart.jsx
│   │   ├── map/
│   │   │   ├── CityMap.jsx
│   │   │   ├── ProjectMarker.jsx
│   │   │   ├── MarkerClusterLayer.jsx
│   │   │   ├── ConflictZoneOverlay.jsx
│   │   │   ├── MapLayerControl.jsx
│   │   │   └── DrawZoneTool.jsx
│   │   ├── projects/
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ProjectTable.jsx
│   │   │   ├── ProjectTimeline.jsx
│   │   │   └── ProjectFilters.jsx
│   │   ├── conflicts/
│   │   │   ├── ConflictCard.jsx
│   │   │   ├── ConflictScoreGauge.jsx
│   │   │   ├── ConflictDetailsPanel.jsx
│   │   │   └── SuggestedActionsList.jsx
│   │   ├── approvals/
│   │   │   ├── ApprovalWorkflowStepper.jsx
│   │   │   ├── ApprovalCard.jsx
│   │   │   └── ApprovalHistoryTimeline.jsx
│   │   ├── notifications/
│   │   │   ├── NotificationList.jsx
│   │   │   ├── NotificationItem.jsx
│   │   │   └── NotificationPreferences.jsx
│   │   └── audit/
│   │       ├── AuditLogTable.jsx
│   │       └── AuditFilterBar.jsx
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ForgotPasswordPage.jsx
│   │   ├── dashboard/DashboardPage.jsx
│   │   ├── projects/
│   │   │   ├── ProjectsListPage.jsx
│   │   │   ├── ProjectDetailsPage.jsx
│   │   │   ├── CreateProjectPage.jsx
│   │   │   └── EditProjectPage.jsx
│   │   ├── map/GISMapPage.jsx
│   │   ├── conflicts/
│   │   │   ├── ConflictsListPage.jsx
│   │   │   └── ConflictDetailsPage.jsx
│   │   ├── approvals/ApprovalsPage.jsx
│   │   ├── notifications/NotificationsPage.jsx
│   │   ├── analytics/AnalyticsPage.jsx
│   │   ├── audit/AuditLogsPage.jsx
│   │   ├── citizen/
│   │   │   ├── CitizenPortalPage.jsx
│   │   │   ├── CitizenProjectDetailsPage.jsx
│   │   │   └── FeedbackFormPage.jsx
│   │   ├── settings/SettingsPage.jsx
│   │   └── error/
│   │       ├── NotFoundPage.jsx
│   │       └── UnauthorizedPage.jsx
│   │
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── formatters.js
│   │   ├── validators.js             # Zod schemas
│   │   ├── conflictScoring.js        # client-side conflict simulation engine
│   │   ├── geoUtils.js               # haversine distance, bbox helpers
│   │   └── permissions.js            # RBAC matrix + can(user, action) helper
│   │
│   ├── styles/
│   │   └── theme.js                  # design tokens referenced by tailwind.config.js
│   │
│   └── lib/
│       └── utils.js                  # shadcn cn() helper
│
├── .env.example
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── components.json                   # shadcn config
├── package.json
└── README.md
```

---

## 8. Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/forgot-password` | ForgotPasswordPage | Public |
| `/pending-approval` | PendingApprovalPage | Public (logged-in, unapproved staff only) |
| `/dashboard` | DashboardPage | Admin, Planner, Approver, Field Engineer |
| `/projects` | ProjectsListPage | Staff |
| `/projects/new` | CreateProjectPage | Admin, Planner |
| `/projects/:id` | ProjectDetailsPage | Staff |
| `/projects/:id/edit` | EditProjectPage | Admin, Planner (own dept), Field Engineer (status only) |
| `/map` | GISMapPage | Staff |
| `/conflicts` | ConflictsListPage | Admin, Planner, Approver |
| `/conflicts/:id` | ConflictDetailsPage | Admin, Planner, Approver |
| `/approvals` | ApprovalsPage | Admin, Approver |
| `/notifications` | NotificationsPage | Staff |
| `/analytics` | AnalyticsPage | Admin, Approver (full); Planner (dept-scoped) |
| `/audit-logs` | AuditLogsPage | Admin only |
| `/settings` | SettingsPage | Staff |
| `/citizen` | CitizenPortalPage | Public Viewer |
| `/citizen/projects/:id` | CitizenProjectDetailsPage | Public Viewer |
| `/citizen/feedback` | FeedbackFormPage | Public Viewer |
| `*` | NotFoundPage | Public |
| `/unauthorized` | UnauthorizedPage | Public |

---

## 9. State & Data Strategy

- **Auth state:** `AuthContext`, persisted to `localStorage` (`udcp_session`). Exposes `user`, `login()`, `logout()`, `hasPermission()`.
- **Server data:** never stored in global Context except where multiple pages need the same cache (`ProjectContext` for the project list, used by both Dashboard and Map). Everything else is fetched per-page with a simple `useEffect` + local `useState` pattern (`data`, `loading`, `error`), or a shared `useAsync(fn)` hook to avoid repeating that boilerplate.
- **Mock layer:** `axios-mock-adapter` intercepts requests at the network layer (not by faking service functions), so real network behavior — loading states, error simulation, artificial latency (300–800ms) — is preserved. This means when backend flips on, nothing about component code changes.
- **Notifications:** `NotificationContext` holds unread count + list, seeded from mock, updated via a `setInterval` "simulated push" every ~20s in dev to demonstrate real-time behavior for judges.

---

## 10. Design Language

Target: **Government Smart-City / Enterprise SaaS**, not a generic admin template.

- **Palette:** deep civic blue primary (`#0B4F8A`–`#1668B8` range), slate neutrals, semantic colors for status (green=approved/completed, amber=pending/under review, red=conflict/rejected, blue=in progress). Department color-coding used consistently across map markers, tags, and charts (define once in `constants.js`, reuse everywhere).
- **Typography:** Inter or similar geometric sans, tight tracking on headings, generous line-height on body.
- **Cards:** soft shadow, 1px border, rounded-xl, never flat-white-on-white — use subtle background tiering (`bg-white` cards on `bg-slate-50` page background; dark mode inverse).
- **Motion (Framer Motion):** page transitions (fade+slight-slide), list item stagger on load, modal/drawer spring transitions, number count-up on dashboard KPIs, conflict score gauge animates in. Keep all durations 150–300ms — snappy, not decorative.
- **Dark mode:** class-based Tailwind dark mode, toggled via `ThemeContext`, persisted to localStorage.
- **Accessibility:** all interactive elements keyboard-navigable, color is never the only signal (status also has icon + text).

---

## 11. Build Roadmap

### Day 1 (today) — Foundation
- Scaffold Vite + Tailwind + shadcn + Framer Motion + React Router.
- Build `config/`, `api/axiosInstance.js`, `api/mock/*` (seed realistic mock data for ~15–20 projects across all departments, with intentional overlaps for conflict demo).
- Build `AuthContext`, `ProtectedRoute`, `RoleBasedRoute`, `permissions.js`.
- Build `DashboardLayout` (Sidebar + Topbar + NotificationBell), `AuthLayout`.
- Landing, Login, Register, Forgot Password pages.

### Day 2 — Core Data Views
- Dashboard page (KPIs + 2–3 charts + recent activity + recent notifications).
- Projects List, Project Details, Create/Edit Project form (with validation).
- `DataTable`, `StatusBadge`, `PriorityTag`, `DepartmentTag` shared components.

### Day 3 — The Differentiators
- GIS Map page (Leaflet + clustering + department color markers + click-to-detail drawer + layer toggle).
- Conflict Detection: `conflictScoring.js` engine + Conflicts List + Conflict Details (score gauge, involved departments, suggested actions).

### Day 4 — Workflow & Governance
- Approval Workflow Stepper + Approvals page (queue for Approver role).
- Notifications Center page + simulated email/SMS log panel.
- Audit Logs page (Admin).

### Day 5 — Public-Facing + Analytics + Polish
- Citizen Portal (read-only project list, road closures, feedback form).
- Analytics page (completion rate, conflict reduction trend, dept performance, budget utilization).
- Settings page, dark mode pass, animation pass, responsive pass, empty/loading/error states everywhere.

### From tomorrow onward, in parallel
- Start backend (Node/Express + PostgreSQL/PostGIS) matching `api/endpoints.js` contracts exactly, so integration on demo day is just flipping `VITE_USE_MOCK=false`.

---

## 12. API Contract (for backend parity — define now, implement mock now, implement real later)

```
POST   /auth/login
POST   /auth/register
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me

GET    /projects            ?department=&status=&priority=&search=&page=
POST   /projects
GET    /projects/:id
PUT    /projects/:id
DELETE /projects/:id
GET    /projects/:id/timeline

GET    /conflicts           ?riskLevel=&department=
GET    /conflicts/:id
POST   /conflicts/:id/resolve

GET    /approvals           ?status=pending
POST   /approvals/:projectId/approve
POST   /approvals/:projectId/reject
GET    /approvals/:projectId/history

GET    /notifications
POST   /notifications/:id/read
GET    /notifications/preferences
PUT    /notifications/preferences

GET    /analytics/completion-rate
GET    /analytics/conflict-trend
GET    /analytics/department-performance
GET    /analytics/budget-utilization

GET    /audit-logs          ?user=&action=&dateFrom=&dateTo=

GET    /citizen/projects
POST   /citizen/feedback
```

`api/endpoints.js` should define these as exported constants exactly as above so the mock adapter and the future real backend agree byte-for-byte.

---

## 13. Deliverables Checklist (Round 2 Prototype)

- [ ] All 20 pages built and navigable per role
- [ ] RBAC enforced on routes and on UI actions (buttons hidden/disabled, not just routes blocked)
- [ ] Staff self-registration flow works (Planner/Approver/Field Engineer sign up → PENDING_APPROVAL → blocked from dashboard → Admin approves from a Pending Staff panel → can then log in). Admin accounts remain seeded-only, never self-registered.
- [ ] GIS map functional with clustering, department colors, click-to-detail
- [ ] Conflict engine visibly detecting overlaps in mock data with score + suggested actions
- [ ] Approval workflow stepper reflects real state machine
- [ ] Notification bell + simulated email/SMS log
- [ ] Charts on Dashboard + Analytics using Recharts
- [ ] Dark mode toggle
- [ ] Fully responsive (mobile citizen portal especially — public users will check road closures on phones)
- [ ] `.env.example` with `VITE_USE_MOCK`, `VITE_API_BASE_URL`, `VITE_MAP_TILE_URL`
- [ ] README documenting how to run, how to switch mock→real backend

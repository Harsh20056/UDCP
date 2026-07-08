import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from './routeConfig.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleBasedRoute from './RoleBasedRoute.jsx';

// Layouts
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import CitizenLayout from '../layouts/CitizenLayout.jsx';

// Public pages
import LandingPage from '../pages/public/LandingPage.jsx';
import LoginPage from '../pages/public/LoginPage.jsx';
import RegisterPage from '../pages/public/RegisterPage.jsx';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage.jsx';
import PendingApprovalPage from '../pages/public/PendingApprovalPage.jsx';

// Staff pages (lazy-ish — imported directly for now, can be lazy later)
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import ProjectsListPage from '../pages/projects/ProjectsListPage.jsx';
import ProjectDetailsPage from '../pages/projects/ProjectDetailsPage.jsx';
import CreateProjectPage from '../pages/projects/CreateProjectPage.jsx';
import EditProjectPage from '../pages/projects/EditProjectPage.jsx';
import GISMapPage from '../pages/map/GISMapPage.jsx';
import ConflictsListPage from '../pages/conflicts/ConflictsListPage.jsx';
import ConflictDetailsPage from '../pages/conflicts/ConflictDetailsPage.jsx';
import ApprovalsPage from '../pages/approvals/ApprovalsPage.jsx';
import NotificationsPage from '../pages/notifications/NotificationsPage.jsx';
import AnalyticsPage from '../pages/analytics/AnalyticsPage.jsx';
import AuditLogsPage from '../pages/audit/AuditLogsPage.jsx';
import SettingsPage from '../pages/settings/SettingsPage.jsx';

// Citizen pages
import CitizenPortalPage from '../pages/citizen/CitizenPortalPage.jsx';
import CitizenProjectDetailsPage from '../pages/citizen/CitizenProjectDetailsPage.jsx';
import FeedbackFormPage from '../pages/citizen/FeedbackFormPage.jsx';

// Error pages
import NotFoundPage from '../pages/error/NotFoundPage.jsx';
import UnauthorizedPage from '../pages/error/UnauthorizedPage.jsx';

const router = createBrowserRouter([
  // ── Root redirect ──────────────────────────────────────────────────────
  {
    path: '/',
    element: <LandingPage />,
  },

  // ── Auth pages ─────────────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LOGIN,            element: <LoginPage /> },
      { path: ROUTES.REGISTER,         element: <RegisterPage /> },
      { path: ROUTES.FORGOT_PASSWORD,  element: <ForgotPasswordPage /> },
      { path: ROUTES.PENDING_APPROVAL, element: <PendingApprovalPage /> },
    ],
  },

  // ── Staff dashboard (protected) ─────────────────────────────────────────
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: ROUTES.DASHBOARD,  element: <DashboardPage /> },

      // Projects
      { path: ROUTES.PROJECTS,   element: <ProjectsListPage /> },
      { path: '/projects/new',   element: <RoleBasedRoute requiredAction="project:create"><CreateProjectPage /></RoleBasedRoute> },
      { path: '/projects/:id',   element: <ProjectDetailsPage /> },
      { path: '/projects/:id/edit', element: <RoleBasedRoute requiredAction="project:edit"><EditProjectPage /></RoleBasedRoute> },

      // Map
      { path: ROUTES.MAP,        element: <GISMapPage /> },

      // Conflicts
      { path: ROUTES.CONFLICTS,  element: <RoleBasedRoute requiredAction="conflict:view"><ConflictsListPage /></RoleBasedRoute> },
      { path: '/conflicts/:id',  element: <RoleBasedRoute requiredAction="conflict:view"><ConflictDetailsPage /></RoleBasedRoute> },

      // Approvals
      { path: ROUTES.APPROVALS,  element: <RoleBasedRoute requiredAction="approval:view"><ApprovalsPage /></RoleBasedRoute> },

      // Notifications
      { path: ROUTES.NOTIFICATIONS, element: <NotificationsPage /> },

      // Analytics
      { path: ROUTES.ANALYTICS,  element: <AnalyticsPage /> },

      // Audit
      { path: ROUTES.AUDIT_LOGS, element: <RoleBasedRoute requiredAction="audit:view"><AuditLogsPage /></RoleBasedRoute> },

      // Settings
      { path: ROUTES.SETTINGS,   element: <SettingsPage /> },
    ],
  },

  // ── Citizen portal (public) ─────────────────────────────────────────────
  {
    element: <CitizenLayout />,
    children: [
      { path: ROUTES.CITIZEN,          element: <CitizenPortalPage /> },
      { path: '/citizen/projects/:id', element: <CitizenProjectDetailsPage /> },
      { path: ROUTES.CITIZEN_FEEDBACK, element: <FeedbackFormPage /> },
    ],
  },

  // ── Error pages ────────────────────────────────────────────────────────
  { path: ROUTES.UNAUTHORIZED, element: <UnauthorizedPage /> },
  { path: '*',                 element: <NotFoundPage /> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}

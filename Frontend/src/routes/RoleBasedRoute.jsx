import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROUTES } from './routeConfig.js';

/**
 * Role-based route guard.
 * Wraps a page component and checks that the current user
 * has the required permission action.
 */
export default function RoleBasedRoute({ children, requiredAction }) {
  const { user, hasPermission } = useAuth();

  if (!requiredAction) return children;

  if (!user || !hasPermission(requiredAction)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
}

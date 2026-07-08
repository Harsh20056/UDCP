import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROUTES } from './routeConfig.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-800">
        <LoadingSpinner size="lg" label="Loading session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Staff account that is PENDING_APPROVAL → redirect to holding page
  if (user?.status === 'PENDING_APPROVAL') {
    return <Navigate to={ROUTES.PENDING_APPROVAL} replace />;
  }

  // Staff account that is REJECTED → redirect to login with message
  if (user?.status === 'REJECTED') {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
}

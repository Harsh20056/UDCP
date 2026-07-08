import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routeConfig.js';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
      <p className="text-8xl font-black text-primary-700 mb-4">404</p>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
      <p className="text-slate-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to={ROUTES.HOME} className="btn-primary btn-md px-6 py-2.5 rounded-lg text-sm font-medium bg-primary-700 text-white hover:bg-primary-600">Go Home</Link>
    </div>
  );
}

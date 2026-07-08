import { Link, useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { ROUTES } from '../../routes/routeConfig.js';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
        <ShieldX className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Access Denied</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">You don't have permission to view this page. Contact your administrator if you believe this is an error.</p>
      <button onClick={() => navigate(-1)} className="bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">Go Back</button>
    </div>
  );
}

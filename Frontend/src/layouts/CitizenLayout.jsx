import { Outlet, Link } from 'react-router-dom';
import { Building2, Phone, Mail } from 'lucide-react';
import { ROUTES } from '../routes/routeConfig.js';

export default function CitizenLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to={ROUTES.CITIZEN} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-700 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-primary-700 text-sm">UDCP</span>
              <span className="text-slate-400 text-xs ml-1.5">Citizen Portal</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to={ROUTES.CITIZEN_FEEDBACK} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Submit Feedback
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="text-sm bg-primary-700 text-white px-3 py-1.5 rounded-lg hover:bg-primary-600 font-medium transition-colors"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-slate-500">
            © 2026 Bhopal Municipal Corporation — UDCP (Unified Department Coordination Platform)
          </p>
          <p className="text-xs text-slate-400 mt-1">For emergencies, call 112. For civic queries: <a href="tel:0755-2441400" className="text-primary-600">0755-2441400</a></p>
        </div>
      </footer>
    </div>
  );
}

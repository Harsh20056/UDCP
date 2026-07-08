import { useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Building2, Phone, Mail, Sun, Moon } from 'lucide-react';
import { ROUTES } from '../routes/routeConfig.js';
import { ThemeContext } from '../context/ThemeContext.jsx';

export default function CitizenLayout() {
  const { isDark, toggle: toggleTheme } = useContext(ThemeContext);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to={ROUTES.CITIZEN} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-primary text-sm">UDCP</span>
              <span className="text-slate-400 text-xs ml-1.5">Citizen Portal</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to={ROUTES.CITIZEN_FEEDBACK} className="text-sm text-primary hover:text-primary/80 font-medium">
              Submit Feedback
            </Link>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to={ROUTES.LOGIN}
              className="text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 font-medium transition-colors"
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
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 Bhopal Municipal Corporation — UDCP (Unified Department Coordination Platform)
          </p>
          <p className="text-xs text-slate-400 mt-1">For emergencies, call 112. For civic queries: <a href="tel:0755-2441400" className="text-primary">0755-2441400</a></p>
        </div>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Landmark, Timer, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../routes/routeConfig.js';
import { ROLE_LABELS } from '../../config/constants.js';

export default function PendingApprovalPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-10 hover:opacity-80 transition-all">
          <Landmark className="w-6 h-6 text-primary-700" />
          <span className="text-lg font-bold text-primary-700 tracking-wider">UDCP</span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-modal w-full max-w-lg p-10 text-center"
      >
        {/* Hourglass icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center">
            <Timer className="w-9 h-9 text-[#0B4F8A] dark:text-[#a2c9ff]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Your account is pending approval
        </h1>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
          An Administrator needs to verify and approve your Department Staff registration
          before you can access the portal. You will receive an email notification once
          your account is active.
        </p>

        {/* Role + Department tags */}
        {user && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary-500" />
              Role: {ROLE_LABELS[user.role] || user.role}
            </span>
            {user.department && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                Department: {user.department}
              </span>
            )}
          </div>
        )}

        {/* Email notification hint */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg py-2.5 px-4 mb-8">
          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
          <span>A confirmation email will be sent to <strong className="text-slate-600 dark:text-slate-400">{user?.email}</strong> once approved.</span>
        </div>

        {/* Back to Login */}
        <Link
          to={ROUTES.LOGIN}
          onClick={logout}
          className="block w-full py-3 rounded-xl border-2 border-primary-700 text-primary-700 font-semibold text-sm hover:bg-primary-50 transition-colors mb-3"
        >
          Back to Login
        </Link>

        <button
          onClick={() => window.location.href = 'mailto:support@udcp.gov'}
          className="text-sm text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors font-medium"
        >
          Contact Support
        </button>
      </motion.div>
    </div>
  );
}

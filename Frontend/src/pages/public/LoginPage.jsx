import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, Building2, Shield,
  AlertCircle, CheckCircle, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../routes/routeConfig.js';
import { DEMO_CREDENTIALS } from '../../api/mock/data/users.js';

// ── Background floating dots (matches the reference screenshot) ──────────────
function FloatingDots() {
  const dots = [
    { cx: '30%', cy: '55%', r: 6,  fill: '#3B82F6', opacity: 0.6 },
    { cx: '70%', cy: '35%', r: 5,  fill: '#F97316', opacity: 0.5 },
    { cx: '55%', cy: '70%', r: 4,  fill: '#EF4444', opacity: 0.4 },
    { cx: '20%', cy: '75%', r: 8,  fill: '#93C5FD', opacity: 0.3 },
    { cx: '80%', cy: '60%', r: 5,  fill: '#6EE7B7', opacity: 0.35 },
    { cx: '45%', cy: '25%', r: 7,  fill: '#FDE68A', opacity: 0.3 },
    { cx: '85%', cy: '80%', r: 4,  fill: '#A78BFA', opacity: 0.3 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} opacity={d.opacity} />
      ))}
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [selectedCred, setSelectedCred] = useState(null);

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.status === 'PENDING_APPROVAL') {
        navigate(ROUTES.PENDING_APPROVAL, { replace: true });
      } else if (user.role === 'public_viewer') {
        navigate(ROUTES.CITIZEN, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredential = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setSelectedCred(cred.role);
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-800">
      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 bg-slate-50 dark:bg-slate-800 relative overflow-hidden">
        <FloatingDots />

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary-700" />
          <span className="text-xs font-bold tracking-widest text-primary-700">UDCP</span>
        </div>

        {/* Hero text */}
        <div className="relative">
          <h1 className="text-5xl font-black text-primary-800 leading-tight mb-4">
            Unified<br />Coordination<br />for Smarter<br />Cities
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-xs">
            Empowering municipal operators with real-time insights and synchronized workflows.
          </p>
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-2 text-slate-400 text-xs">
          <Shield className="w-3.5 h-3.5" />
          Secure Government Network Access
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Login Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-modal p-8 mb-4">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-700" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-1">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">Sign in to your department account</p>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 mb-4 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="login-email">
                  Department Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@city.gov"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="login-password">
                    Password
                  </label>
                  <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-primary-700 text-white font-semibold text-sm hover:bg-primary-600 active:bg-primary-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
            </div>

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                New department staff?{' '}
                <Link to={ROUTES.REGISTER} className="text-primary-600 hover:text-primary-700 font-semibold">
                  Register here
                </Link>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Citizen?{' '}
                <Link to={ROUTES.CITIZEN} className="text-primary-600 hover:text-primary-700 font-semibold">
                  View the public portal
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Credentials Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-card p-5"
          >
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase text-center mb-4">
              Demo Access Credentials
            </p>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map(cred => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => fillCredential(cred)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left transition-all text-sm ${
                    selectedCred === cred.role
                      ? 'border-primary-300 bg-primary-50 text-primary-700'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-xs leading-none mb-0.5">{cred.role}</p>
                    <p className="text-slate-400 text-xs font-mono truncate">{cred.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs text-slate-400 font-mono hidden sm:block">{cred.password}</span>
                    {selectedCred === cred.role
                      ? <CheckCircle className="w-4 h-4 text-primary-600" />
                      : <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    }
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mt-3">Click any role to auto-fill credentials</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

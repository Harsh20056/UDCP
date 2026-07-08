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
    { cx: '30%', cy: '55%', r: 6, fill: '#3B82F6', opacity: 0.6 },
    { cx: '70%', cy: '35%', r: 5, fill: '#F97316', opacity: 0.5 },
    { cx: '55%', cy: '70%', r: 4, fill: '#EF4444', opacity: 0.4 },
    { cx: '20%', cy: '75%', r: 8, fill: '#93C5FD', opacity: 0.3 },
    { cx: '80%', cy: '60%', r: 5, fill: '#6EE7B7', opacity: 0.35 },
    { cx: '45%', cy: '25%', r: 7, fill: '#3B82F6', opacity: 0.3 },
    { cx: '85%', cy: '80%', r: 4, fill: '#A78BFA', opacity: 0.3 },
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      
      {/* ── Main Login Div ── */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-modal overflow-hidden flex flex-col lg:flex-row mb-6">
        
        {/* Left panel (branding text) */}
        <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-10 bg-[#0B4F8A] dark:bg-slate-950 text-white relative overflow-hidden shrink-0 border-r border-[#003866] dark:border-slate-900">
          <FloatingDots />
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/AP1WRLsSovemGf2n5MeG9sdGbFTjA31bsKZDzqXW1lAyacrwisx6ut7hZUaxTCJixq12rhVUJUPSSOL0MhJpfQJTPw1pUQvLkA7u0k1OKr8p7YSXUZZfSasfplC4PwRpVCOOsZONvdnEGHx8HFhyGZgrxxRlh7UHniyWJnZpQ9gW7Tf6t7zP5E3ol22g4ZqSBKQbI1sGJB4KGFrJLQzCuUII0YEn3jGSu41BPVaqGSSEO-U9vECDdWbjnLJxK1U')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

          {/* Logo */}
          <Link to={ROUTES.HOME} className="relative z-10 flex items-center gap-2 hover:opacity-85 transition-opacity">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-bold tracking-widest text-white">UDCP</span>
          </Link>

          {/* Hero text */}
          <div className="relative my-auto py-8 z-10">
            <h1 className="text-3xl font-bold leading-tight mb-4 tracking-tight">
              Unified Coordination for Smarter Cities
            </h1>
            <p className="text-blue-100/80 text-sm leading-relaxed max-w-xs">
              Empowering municipal operators with real-time insights and synchronized workflows.
            </p>
          </div>

          {/* Footer */}
          <div className="relative flex items-center gap-2 text-blue-200/60 text-xs z-10 font-medium">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            Secure Government Network Access
          </div>
        </div>

        {/* Right panel (login form) */}
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 bg-white dark:bg-slate-900">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <Link to={ROUTES.HOME} className="flex items-center gap-2 hover:opacity-85 transition-opacity">
                <Building2 className="w-5 h-5 text-[#0B4F8A] dark:text-[#a2c9ff]" />
                <span className="text-sm font-bold tracking-widest text-slate-800 dark:text-slate-200">UDCP</span>
              </Link>
            </div>

            <div className="w-full max-w-[440px] mx-auto">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#a2c9ff]/20 text-[#003866] dark:text-[#a2c9ff] mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Welcome back</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your department account</p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-lg px-3 py-2.5 mb-4 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1.5" htmlFor="login-email">
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
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350" htmlFor="login-password">
                      Password
                    </label>
                    <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-primary hover:underline font-medium">
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
                      className="w-full pl-9 pr-10 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors focus:outline-none"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm font-semibold text-white bg-[#0B4F8A] hover:bg-[#003866] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed items-center gap-2 mt-2"
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
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">or</span>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-col space-y-2 text-center">
                <Link to={ROUTES.REGISTER} className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#003866] dark:hover:text-[#a2c9ff] transition-colors font-medium">
                  New department staff? Register here
                </Link>
                <Link to={ROUTES.CITIZEN} className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#003866] dark:hover:text-[#a2c9ff] transition-colors font-medium">
                  Citizen? View the public portal
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Demo Credentials Div (placed below main login div) ── */}
      <div className="w-full max-w-5xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 text-center shadow-sm">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-400 mb-3 uppercase tracking-wider">Demo Access Credentials</p>
        <div className="flex flex-wrap justify-center gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-350">
          {DEMO_CREDENTIALS.map(cred => (
            <button
              key={cred.role}
              type="button"
              onClick={() => fillCredential(cred)}
              className={`px-2.5 py-1 rounded bg-white dark:bg-slate-900 border transition-all focus:outline-none ${
                selectedCred === cred.role
                  ? 'border-[#0b4f8a] text-[#0b4f8a] font-semibold ring-1 ring-primary/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
              }`}
            >
              {cred.email}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2">Click credentials to auto-fill details</p>
      </div>

    </div>
  );
}

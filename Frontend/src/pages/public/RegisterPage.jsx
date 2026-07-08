import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff, Building2,
  Info, AlertCircle, CheckCircle, ChevronDown, Shield,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { ROUTES } from '../../routes/routeConfig.js';
import { DEPARTMENT_LIST } from '../../config/constants.js';

// ── Background floating dots (matches the login page) ────────────────────────
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

const STAFF_ROLES = [
  { value: 'department_planner', label: 'Department Planner' },
  { value: 'approver', label: 'Approver' },
  { value: 'field_engineer', label: 'Field Engineer' },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState('citizen'); // 'citizen' | 'staff'
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [role, setRole] = useState('department_planner');
  const [department, setDepartment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (tab === 'staff' && !department) {
      setError('Please select your department.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(ENDPOINTS.AUTH_REGISTER, {
        name,
        email,
        password,
        role: tab === 'citizen' ? 'public_viewer' : role,
        department: tab === 'citizen' ? null : department,
      });

      if (tab === 'citizen') {
        // Citizen: immediately redirect to citizen portal after auto-login hint
        navigate(ROUTES.LOGIN, {
          state: { message: 'Account created! Please sign in.' },
          replace: true,
        });
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Pending approval confirmation screen ─────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-modal p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Registration Submitted</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Your account request has been submitted. An Administrator will review and approve your access.
            You'll be able to sign in once approved.
          </p>
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-lg px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 mb-6 text-left">
            <strong>Account Status:</strong> Pending Admin Approval
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
          >
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      
      {/* ── Main Register Div ── */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-modal overflow-hidden flex flex-col lg:flex-row mb-6">
        
        {/* Left panel (branding text) */}
        <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-10 bg-slate-50 dark:bg-slate-950 text-white relative overflow-hidden shrink-0 border-r border-[#003866] dark:border-slate-900">
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

        {/* Right panel (register form) */}
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

            <div className="w-full max-w-lg mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Create an Account</h2>

                {/* ── Tabs ── */}
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 mb-6">
                  {[
                    { key: 'citizen', label: 'Citizen' },
                    { key: 'staff', label: 'Department Staff' },
                  ].map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => { setTab(t.key); setError(''); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${tab === t.key
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300'
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 dark:bg-red-955 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-lg px-3 py-2.5 mb-5 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1.5" htmlFor="reg-name">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="reg-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1.5" htmlFor="reg-email">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="reg-email"
                        type="email"
                        placeholder={tab === 'staff' ? 'you@city.gov' : 'you@example.com'}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Department (Staff only) */}
                  {tab === 'staff' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1.5">
                        Department
                      </label>
                      <div className="relative">
                        <select
                          value={department}
                          onChange={e => setDepartment(e.target.value)}
                          required
                          className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select your department</option>
                          {DEPARTMENT_LIST.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1.5" htmlFor="reg-password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="reg-password"
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

                  {/* Notice */}
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3.5 border border-slate-100 dark:border-slate-850 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    <p className="flex items-start gap-1.5">
                      <span className="font-semibold text-primary-700 dark:text-primary-400">Note:</span>
                      {tab === 'citizen'
                        ? "You'll get instant access to view ongoing projects and submit feedback."
                        : 'Department Staff accounts require Admin approval before access is granted. You will receive a confirmation once approved.'}
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-600 active:bg-primary-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account…
                      </>
                    ) : 'Create Account'}
                  </button>
                </form>

                {/* Divider + sign in link */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
                </div>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-semibold">
                    Sign in
                  </Link>
                </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

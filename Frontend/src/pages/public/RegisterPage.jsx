import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff, Building2,
  Info, AlertCircle, CheckCircle, ChevronDown,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { ROUTES } from '../../routes/routeConfig.js';
import { DEPARTMENT_LIST } from '../../config/constants.js';

// ── GIS Background SVG (same as Register reference) ─────────────────────────
function GISBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg viewBox="0 0 600 800" fill="none" className="absolute inset-0 w-full h-full opacity-60">
        {/* Grid */}
        {[100, 200, 300, 400, 500].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="800" stroke="#CBD5E1" strokeWidth="1" />
        ))}
        {[100, 200, 300, 400, 500, 600, 700].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="600" y2={y} stroke="#CBD5E1" strokeWidth="1" />
        ))}
        {/* Cross-hair */}
        <line x1="300" y1="0" x2="300" y2="800" stroke="#94A3B8" strokeWidth="2" />
        <line x1="0" y1="400" x2="600" y2="400" stroke="#94A3B8" strokeWidth="2" />
        {/* Selection box */}
        <rect x="150" y="270" width="200" height="160" rx="2"
          stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="6 4" fill="rgba(219,234,254,0.25)" />
        {/* Conflict circle */}
        <circle cx="300" cy="400" r="130"
          stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="6 4" fill="rgba(239,246,255,0.3)" />
        {/* Markers */}
        <circle cx="180" cy="310" r="8" fill="#10B981" />
        <circle cx="180" cy="310" r="4" fill="white" />
        <circle cx="300" cy="420" r="9" fill="#EF4444" />
        <circle cx="300" cy="420" r="4.5" fill="white" />
        <circle cx="460" cy="480" r="8" fill="#F59E0B" />
        <circle cx="460" cy="480" r="4" fill="white" />
        <circle cx="170" cy="600" r="8" fill="#3B82F6" />
        <circle cx="170" cy="600" r="4" fill="white" />
      </svg>
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/60 to-slate-50" />
    </div>
  );
}

const STAFF_ROLES = [
  { value: 'department_planner', label: 'Department Planner' },
  { value: 'approver',           label: 'Approver' },
  { value: 'field_engineer',     label: 'Field Engineer' },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [tab, setTab]               = useState('citizen'); // 'citizen' | 'staff'
  const [showPw, setShowPw]         = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  // Form fields
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [role, setRole]             = useState('department_planner');
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-modal p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Your account request has been submitted. An Administrator will review and approve your access.
            You'll be able to sign in once approved.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-700 mb-6 text-left">
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
    <div className="min-h-screen flex bg-slate-100">
      {/* ── Left panel ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden bg-slate-100">
        <GISBackground />

        {/* Logo */}
        <div className="relative flex items-center gap-2 z-10">
          <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center shadow-sm">
            <Building2 className="w-4 h-4 text-primary-700" />
          </div>
          <span className="font-bold text-slate-900">UDCP</span>
        </div>

        {/* Bottom text */}
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-3">
            Unified Department<br />Coordination Platform
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            Connecting civic departments and citizens for streamlined urban operations and planning.
          </p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-modal p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Create an Account</h2>

            {/* ── Tabs ── */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              {[
                { key: 'citizen', label: 'Citizen' },
                { key: 'staff',   label: 'Department Staff' },
              ].map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { setTab(t.key); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    tab === t.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Error ── */}
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
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="reg-name"
                    type="text"
                    placeholder={tab === 'citizen' ? 'Jane Doe' : 'Ramesh Kumar'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder={tab === 'citizen' ? 'jane@example.com' : 'you@dept.bhopal.gov'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Staff-only: Role + Department ────────────────────── */}
              <AnimatePresence>
                {tab === 'staff' && (
                  <motion.div
                    key="staff-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-role">
                        Role
                      </label>
                      <div className="relative">
                        <select
                          id="reg-role"
                          value={role}
                          onChange={e => setRole(e.target.value)}
                          className="w-full appearance-none pl-3 pr-9 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
                        >
                          {STAFF_ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-dept">
                        Department
                      </label>
                      <div className="relative">
                        <select
                          id="reg-dept"
                          value={department}
                          onChange={e => setDepartment(e.target.value)}
                          className="w-full appearance-none pl-3 pr-9 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
                        >
                          <option value="">Select department…</option>
                          {DEPARTMENT_LIST.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-pw">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="reg-pw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-confirm-pw">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="reg-confirm-pw"
                    type={showConfirmPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-3">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
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
              <div className="flex-1 h-px bg-slate-200" />
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Map, CheckSquare, Bell,
  ArrowRight, Building2, Shield, ChevronRight,
} from 'lucide-react';
import { ROUTES } from '../../routes/routeConfig.js';

// ── GIS Map Illustration (SVG, matches the reference) ──────────────────────
function GISIllustration() {
  return (
    <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Grid lines */}
      {[60, 120, 180, 240, 300, 360, 420].map(x => (
        <line key={`vl-${x}`} x1={x} y1="0" x2={x} y2="360" stroke="#CBD5E1" strokeWidth="1" />
      ))}
      {[60, 120, 180, 240, 300].map(y => (
        <line key={`hl-${y}`} x1="0" y1={y} x2="480" y2={y} stroke="#CBD5E1" strokeWidth="1" />
      ))}

      {/* Cross-hair lines (thicker, darker) */}
      <line x1="240" y1="0" x2="240" y2="360" stroke="#94A3B8" strokeWidth="2" />
      <line x1="0" y1="180" x2="480" y2="180" stroke="#94A3B8" strokeWidth="2" />

      {/* Dashed selection rectangle */}
      <rect x="140" y="100" width="140" height="120" rx="2"
        stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="6 4" fill="rgba(219,234,254,0.3)" />

      {/* Conflict zone circle */}
      <circle cx="240" cy="180" r="80"
        stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="6 4" fill="rgba(239,246,255,0.4)" />

      {/* Map markers */}
      {/* Green marker — top-left area */}
      <circle cx="170" cy="130" r="8" fill="#10B981" />
      <circle cx="170" cy="130" r="4" fill="white" />

      {/* Red marker — center (conflict) */}
      <circle cx="240" cy="180" r="9" fill="#EF4444" />
      <circle cx="240" cy="180" r="4.5" fill="white" />

      {/* Orange marker — right */}
      <circle cx="380" cy="200" r="8" fill="#F59E0B" />
      <circle cx="380" cy="200" r="4" fill="white" />

      {/* Blue marker — bottom-left */}
      <circle cx="160" cy="270" r="8" fill="#3B82F6" />
      <circle cx="160" cy="270" r="4" fill="white" />

      {/* Conflict zone shading */}
      <circle cx="240" cy="180" r="60" fill="rgba(239,68,68,0.07)" />

      {/* Subtle label */}
      <text x="248" y="176" fontSize="9" fill="#64748B" fontFamily="Inter, sans-serif">Conflict Zone</text>
    </svg>
  );
}

// ── Feature cards ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: LayoutDashboard,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'Centralized Project Management',
    desc: 'Unified view for all infrastructure projects across every department in real time.',
  },
  {
    icon: Map,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    title: 'GIS-Based Conflict Detection',
    desc: 'Automatic identification of spatial and temporal overlaps before excavation begins.',
  },
  {
    icon: CheckSquare,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    title: 'Structured Approval Workflows',
    desc: 'Streamlined multi-departmental review with full audit trail and role-based actions.',
  },
  {
    icon: Bell,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Real-Time Notifications',
    desc: 'Immediate alerts for planning updates and critical conflicts across all channels.',
  },
];

// ── Stats strip ─────────────────────────────────────────────────────────────
const STATS = [
  { value: '7', label: 'Departments' },
  { value: '20+', label: 'Active Projects' },
  { value: '92%', label: 'Conflict Detection Rate' },
  { value: '40%', label: 'Cost Savings' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Building2 className="w-5 h-5 text-primary-700" />
              <span className="font-bold text-primary-700 text-sm tracking-widest">UDCP</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">
              Solution
            </a>
            <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">
              How It Works
            </a>
            <a href="#departments" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">
              For Departments
            </a>
            <Link to={ROUTES.CITIZEN} className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">
              Citizen Portal
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="px-4 py-2 rounded-lg border border-primary-700 text-primary-700 text-sm font-semibold hover:bg-primary-50 transition-colors"
            >
              Log In
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero section ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-64px)]">
        {/* Left: Headline */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary-100"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
              IDS 2026 — Bhopal, Madhya Pradesh
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
              One City.<br />One Platform.<br />
              <span className="text-primary-700">One Plan.</span>
            </h1>
          </div>

          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
            Eliminate duplicate excavation and inter-departmental conflict via real-time coordination.
            Unified visibility for smarter, faster civic infrastructure management.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-600 active:bg-primary-800 transition-colors shadow-sm"
            >
              Login to Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={ROUTES.CITIZEN}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:border-primary-300 hover:text-primary-700 transition-colors"
            >
              View Citizen Portal
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            {STATS.map(stat => (
              <div key={stat.label}>
                <p className="text-2xl font-black text-primary-700">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: GIS Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative"
        >
          <div className="relative bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg"
            style={{ aspectRatio: '4/3' }}>
            {/* Subtle inner border */}
            <div className="absolute inset-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl pointer-events-none z-10" />
            <GISIllustration />

            {/* Floating conflict badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute top-4 right-4 bg-white dark:bg-slate-900 rounded-lg shadow-card border border-red-100 px-3 py-2 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-600">Conflict Detected</span>
            </motion.div>

            {/* Floating approval badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-4 left-4 bg-white dark:bg-slate-900 rounded-lg shadow-card border border-green-100 px-3 py-2 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-green-600">3 Projects Active</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Features section ── */}
      <section id="features" className="bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Everything your city needs, in one place</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Built for municipal departments to coordinate infrastructure without conflicts, delays, or duplicated effort.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={item}
                  className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-shadow duration-200 group cursor-default"
                >
                  <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-snug">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section id="departments" className="bg-primary-700 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to coordinate smarter?
          </h2>
          <p className="text-primary-200 mb-8 max-w-lg mx-auto">
            Join departments across Bhopal already using UDCP to eliminate infrastructure conflicts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-primary-700 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors shadow-sm"
            >
              Register Department
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to={ROUTES.CITIZEN}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold text-sm hover:bg-white dark:bg-slate-900/10 transition-colors"
            >
              Citizen Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <Building2 className="w-4 h-4 text-primary-400" />
            <span className="font-bold text-sm text-primary-400 tracking-widest">UDCP</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm ml-2">© 2026 Bhopal Municipal Corporation</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <Shield className="w-3.5 h-3.5" />
            Secure Government Network
          </div>
        </div>
      </footer>
    </div>
  );
}

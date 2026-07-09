import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Map, CheckSquare, Bell,
  ArrowRight, Building2, Shield, ChevronRight,
  UploadCloud, GitFork, Users2, FileCheck2,
  AlertTriangle, FileText, Moon, Sun,
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext.jsx';
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

// ── Clean Waving Ribbon Indian Flag SVG ──────────────────────
function CleanIndianFlag() {
  return (
    <svg viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-sm">
      <defs>
        {/* Gradients for smooth, clean vector 3D look */}
        <linearGradient id="flag-saffron-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="100%" stopColor="#E67E22" />
        </linearGradient>
        <linearGradient id="flag-green-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#138808" />
          <stop offset="100%" stopColor="#0F6F06" />
        </linearGradient>
        <linearGradient id="flag-white-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5F5F5" />
        </linearGradient>
      </defs>

      {/* Flag Stripes (rendered with precise wave curves) */}
      <g>
        {/* Saffron Stripe */}
        <path d="M 40,60 C 130,45 220,75 310,60 C 390,48 450,58 470,60 L 470,105 C 450,103 390,93 310,105 C 220,120 130,90 40,105 Z" fill="url(#flag-saffron-grad)" />
        
        {/* White Stripe */}
        <path d="M 40,105 C 130,90 220,120 310,105 C 390,93 450,103 470,105 L 470,150 C 450,148 390,138 310,150 C 220,165 130,135 40,150 Z" fill="url(#flag-white-grad)" />
        
        {/* Green Stripe */}
        <path d="M 40,150 C 130,135 220,165 310,150 C 390,138 450,148 470,150 L 470,195 C 450,193 390,183 310,195 C 220,210 130,180 40,195 Z" fill="url(#flag-green-grad)" />
      </g>

      {/* Ashoka Chakra */}
      <g transform="translate(255, 127)">
        <circle cx="0" cy="0" r="21" stroke="#000080" strokeWidth="2.5" fill="none" />
        <circle cx="0" cy="0" r="3.5" fill="#000080" />
        {/* 24 Spokes */}
        {[...Array(24)].map((_, i) => {
          const angle = (i * 360) / 24;
          const rad = (angle * Math.PI) / 180;
          const x2 = 21 * Math.cos(rad);
          const y2 = 21 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={0}
              y1={0}
              x2={x2}
              y2={y2}
              stroke="#000080"
              strokeWidth="1.2"
            />
          );
        })}
        {/* Tiny dots on the outer edge */}
        {[...Array(24)].map((_, i) => {
          const angle = ((i + 0.5) * 360) / 24;
          const rad = (angle * Math.PI) / 180;
          const cx = 19.5 * Math.cos(rad);
          const cy = 19.5 * Math.sin(rad);
          return (
            <circle
              key={`dot-${i}`}
              cx={cx}
              cy={cy}
              r="0.7"
              fill="#000080"
            />
          );
        })}
      </g>
    </svg>
  );
}

// ── Stylized Brush Painted Indian Flag SVG ──────────────────────
function IndianFlagBrush() {
  return (
    <svg viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-md">
      <defs>
        {/* The filter to create the rough, organic hand-painted brush edges */}
        <filter id="brush-edges" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        
        {/* Gradient for subtle flag texture */}
        <linearGradient id="brush-saffron" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="100%" stopColor="#FF771F" />
        </linearGradient>
        <linearGradient id="brush-green" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#138808" />
          <stop offset="100%" stopColor="#0B6B04" />
        </linearGradient>
      </defs>

      {/* Flag Stripes (rendered with the displacement filter) */}
      <g filter="url(#brush-edges)">
        {/* Saffron Stripe (slightly wavy path) */}
        <path d="M 40,55 C 120,40 240,65 360,45 C 430,35 470,50 480,55 L 475,100 C 460,95 420,85 360,95 C 240,115 120,85 35,100 Z" fill="url(#brush-saffron)" opacity="0.95" />
        
        {/* White Stripe (slightly overlapping the saffron and green) */}
        <path d="M 33,103 C 115,88 235,112 355,95 C 425,85 465,97 478,103 L 473,150 C 458,145 418,135 355,145 C 235,162 115,135 30,150 Z" fill="#FFFFFF" opacity="0.98" />
        
        {/* Green Stripe */}
        <path d="M 28,153 C 110,138 230,162 350,145 C 420,135 460,147 473,153 L 468,198 C 453,193 413,183 350,193 C 230,210 110,183 25,198 Z" fill="url(#brush-green)" opacity="0.95" />

        {/* Small paint splatters for realistic brush effect */}
        <circle cx="25" cy="50" r="3" fill="#FF9933" opacity="0.7" />
        <circle cx="485" cy="70" r="4" fill="#FF9933" opacity="0.6" />
        <circle cx="490" cy="165" r="3" fill="#138808" opacity="0.6" />
        <circle cx="15" cy="180" r="5" fill="#138808" opacity="0.7" />
        <circle cx="18" cy="120" r="2" fill="#777777" opacity="0.4" />
      </g>

      {/* Ashoka Chakra (not filtered, needs to remain sharp and clean) */}
      <g transform="translate(250, 125)">
        <circle cx="0" cy="0" r="23" stroke="#000080" strokeWidth="2.5" fill="none" />
        <circle cx="0" cy="0" r="4" fill="#000080" />
        {/* 24 Spokes */}
        {[...Array(24)].map((_, i) => {
          const angle = (i * 360) / 24;
          const rad = (angle * Math.PI) / 180;
          const x2 = 23 * Math.cos(rad);
          const y2 = 23 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={0}
              y1={0}
              x2={x2}
              y2={y2}
              stroke="#000080"
              strokeWidth="1.2"
            />
          );
        })}
        {/* Tiny decorative circles between spokes at the outer edge */}
        {[...Array(24)].map((_, i) => {
          const angle = ((i + 0.5) * 360) / 24;
          const rad = (angle * Math.PI) / 180;
          const cx = 21.5 * Math.cos(rad);
          const cy = 21.5 * Math.sin(rad);
          return (
            <circle
              key={`dot-${i}`}
              cx={cx}
              cy={cy}
              r="0.8"
              fill="#000080"
            />
          );
        })}
      </g>
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

const WORKFLOW_STEPS = [
  {
    number: '01',
    title: 'Upload Project Plans',
    desc: 'Municipal departments upload planned excavation work, coordinates, and timelines using shapefiles or manual drawings.',
    icon: UploadCloud,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-100 dark:border-amber-900/50'
  },
  {
    number: '02',
    title: 'Automated Conflict Run',
    desc: 'The GIS engine scans the spatial database in real-time, detecting conflicts with pipelines, cables, and other works.',
    icon: GitFork,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-100 dark:border-red-900/50'
  },
  {
    number: '03',
    title: 'Joint Review Resolution',
    desc: 'Conflicting departments collaborate directly on the platform to adjust schedules, re-route lines, or combine digs.',
    icon: Users2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-100 dark:border-blue-900/50'
  },
  {
    number: '04',
    title: 'No-Objection Permit',
    desc: 'After mutual alignment, digital NOCs are logged, routing history is updated, and Coordinated Excavation starts.',
    icon: FileCheck2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-100 dark:border-green-900/50'
  }
];

const DEPARTMENTS = [
  { name: 'Bhopal Municipal Corporation (BMC)', role: 'Urban Local Body & Water Supply Services', logoBg: 'bg-[#FF9933]/10 text-[#FF9933]' },
  { name: 'Public Works Department (PWD)', role: 'State Highway & Main Arterial Road Network', logoBg: 'bg-blue-500/10 text-blue-500' },
  { name: 'Bhopal Smart City Development Corp (BSCDCL)', role: 'IT infrastructure & Smart Grid Operations', logoBg: 'bg-purple-500/10 text-purple-500' },
  { name: 'MP Madhya Kshetra Vidyut Vitaran (MPMKVV)', role: 'Power Distribution & Underground Cabling', logoBg: 'bg-amber-500/10 text-amber-500' },
  { name: 'Narmada Valley Development Authority', role: 'Main Trunk Water Pipeline Distribution', logoBg: 'bg-teal-500/10 text-teal-500' },
  { name: 'BSNL & Telecom Operators Consortium', role: 'Fiber Duct Laying & High-Speed Network Grid', logoBg: 'bg-[#138808]/10 text-[#138808]' },
  { name: 'Bhopal Gas Leak Disaster Dept', role: 'Hazard Safety & Disaster Coordination Control', logoBg: 'bg-red-500/10 text-red-500' },
];

const CITIZEN_TOOLS = [
  {
    title: 'Live Road Excavation Map',
    desc: 'View active and scheduled digging works across Bhopal in real-time, avoiding traffic delays and roadblocks.',
    icon: Map,
    action: 'Open Map',
    link: ROUTES.CITIZEN
  },
  {
    title: 'Report Civic Nuisance / Delays',
    desc: 'File complaints regarding delayed project closure, missing safety barricades, or unauthorized road digging.',
    icon: AlertTriangle,
    action: 'File Report',
    link: ROUTES.CITIZEN_FEEDBACK
  },
  {
    title: 'Public Feedback Forum',
    desc: 'Provide suggestions on local municipal projects and review infrastructure quality ratings in your area.',
    icon: FileText,
    action: 'Submit Feedback',
    link: ROUTES.CITIZEN_FEEDBACK
  }
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
  const { isDark, toggle: toggleTheme } = useContext(ThemeContext);
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-700">
        {/* Sleek Tri-color Stripe */}
        <div className="h-[3px] w-full flex">
          <div className="w-1/3 bg-[#FF9933]"></div>
          <div className="w-1/3 bg-white dark:bg-slate-900"></div>
          <div className="w-1/3 bg-[#138808]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Building2 className="w-5 h-5 text-primary-700" />
              <span className="font-bold text-primary-700 text-sm tracking-widest">UDCP</span>
            </div>
            {/* Elegant Tri-color flag indicator */}
            <div className="flex flex-col w-4 h-3 gap-0.5 ml-2 overflow-hidden rounded-[1px] opacity-80 select-none">
              <div className="h-1 bg-[#FF9933]"></div>
              <div className="h-1 bg-white flex items-center justify-center relative">
                <div className="w-[3px] h-[3px] rounded-full bg-[#000080]"></div>
              </div>
              <div className="h-1 bg-[#138808]"></div>
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
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

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
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-64px)] relative overflow-hidden">
        {/* Diagonal Brush Stroke Indian Flag Watermark */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none flex items-center justify-center opacity-[0.14] dark:opacity-[0.09]">
          <div className="w-[140%] h-[140%] transform -rotate-12 scale-110 flex items-center justify-center">
            <IndianFlagBrush />
          </div>
        </div>

        {/* Left: Headline */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 relative overflow-visible z-10"
        >
          <div className="space-y-4 relative z-10">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
              One City.<br />One Platform.<br />
              <span className="text-primary-700">One Plan.</span>
            </h1>
          </div>

          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-md relative z-10">
            Eliminate duplicate excavation and inter-departmental conflict via real-time coordination.
            <span className="block mt-2 font-medium text-slate-700 dark:text-slate-300">Under the aegis of Bhopal Municipal Corporation & Smart Cities Mission.</span>
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

            {/* Floating Indian Flag / BMC Official Emblem badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-lg shadow-card border border-slate-200 dark:border-slate-700 px-3 py-1.5 flex items-center gap-2.5 z-20 select-none"
            >
              <div className="w-9 h-6 flex-shrink-0">
                <CleanIndianFlag />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold leading-none">Smart Cities Bhopal</span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">Govt of MP</span>
              </div>
            </motion.div>

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
      <section id="features" className="bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-12">
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
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              // alternate hover glow classes: saffron glow for even, green glow for odd
              const hoverGlow = i % 2 === 0 ? 'hover-saffron-glow' : 'hover-green-glow';
              return (
                <motion.div
                  key={f.title}
                  variants={item}
                  className={`bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-default ${hoverGlow}`}
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

      {/* ── How It Works section ── */}
      <section className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 relative overflow-hidden">
        {/* Subtle background strip */}
        <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">How Coordinated Excavation Works</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Our automated system guides departments through proposal, detection, joint review, and final NOC approvals.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting lines for large screens */}
            <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-12 z-0" />
            
            {WORKFLOW_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative z-10 text-center flex flex-col items-center group"
                >
                  {/* Step counter */}
                  <span className="absolute top-4 right-4 text-xs font-bold text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors">
                    {step.number}
                  </span>
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-full ${step.bgColor} border ${step.borderColor} flex items-center justify-center mb-6`}>
                    <Icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3 text-base">{step.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Participating Departments section ── */}
      <section className="bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Integrated Bhopal Departments</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Real-time pipeline data and project synchronization across Madhya Pradesh state and municipal bodies.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
            {DEPARTMENTS.map((dept, idx) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-start gap-3 shadow-2xs group hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs ${dept.logoBg}`}>
                  {dept.name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">{dept.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">{dept.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Citizen Engagement Portal Section ── */}
      <section className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 relative overflow-hidden">
        {/* Soft decorative glow background */}
        <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-[#138808]/5 dark:bg-[#138808]/[0.02] blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            {/* Left side: explanation */}
            <div className="md:col-span-5 space-y-6 text-left">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 rounded-full text-xs font-bold uppercase tracking-wider">
                Public Transparency
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                Empowering Citizens.<br/>Ensuring Accountable Infrastructure.
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                UDCP connects local residents directly with municipal coordination data. Citizens can view live road digs, report safety concerns, or provide feedback on construction sites.
              </p>
              <div className="pt-2">
                <Link
                  to={ROUTES.CITIZEN}
                  className="inline-flex items-center gap-2 text-primary-700 dark:text-primary-400 hover:text-primary-600 font-bold text-sm transition-colors group"
                >
                  Enter Public Portal
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right side: visual cards for citizen actions */}
            <div className="md:col-span-7 grid sm:grid-cols-3 gap-6">
              {CITIZEN_TOOLS.map((tool, idx) => {
                const ToolIcon = tool.icon;
                return (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:bg-white dark:hover:bg-slate-900 shadow-2xs hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-900/50">
                        <ToolIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-2 leading-snug group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                        {tool.desc}
                      </p>
                    </div>
                    
                    <Link
                      to={tool.link}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-700 dark:text-primary-400 hover:text-primary-600 transition-colors"
                    >
                      {tool.action}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section id="departments" className="bg-primary-700 py-10">
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
            <span className="text-slate-400 text-sm ml-2 font-medium">Bhopal Municipal Corporation</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 text-xs">
            <div className="flex items-center gap-1.5 border-r border-slate-800 pr-4">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>NIC Secure Gateway</span>
            </div>
            <div className="flex items-center gap-1.5 border-r border-slate-800 pr-4">
              <span>Digital India Initiative</span>
            </div>
            <div className="text-slate-600">
              © 2026 BMC. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderOpen, CheckSquare, AlertTriangle, Building2,
  TrendingUp, ArrowRight, MoreVertical, SlidersHorizontal,
  CheckCheck, Folder, Clock, TriangleAlert,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { ROUTES } from '../../routes/routeConfig.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DepartmentTag from '../../components/common/DepartmentTag.jsx';
import PriorityTag from '../../components/common/PriorityTag.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { formatCurrencyShort } from '../../utils/formatters.js';
import { timeAgo } from '../../utils/dateUtils.js';
import { DEPARTMENT_SHORT, DEPARTMENT_COLORS } from '../../config/constants.js';

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

// ── KPI Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconColor, sub, subIcon: SubIcon, subColor, highlight, i }) {
  return (
    <motion.div
      custom={i}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={`bg-white dark:bg-slate-900 rounded-xl border shadow-card p-5 flex flex-col gap-3 ${
        highlight ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-4xl font-black text-slate-900 dark:text-slate-100 mt-1 leading-none">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      {sub && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${subColor || 'text-slate-500 dark:text-slate-400'}`}>
          {SubIcon && <SubIcon className="w-3.5 h-3.5" />}
          {sub}
        </div>
      )}
    </motion.div>
  );
}

// ── Donut chart custom label ──────────────────────────────────────────────────
function DonutCenterLabel({ cx, cy, total }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-6" fontSize="28" fontWeight="900" fill="#1E293B">{total}</tspan>
      <tspan x={cx} dy="22" fontSize="11" fill="#94A3B8">Total</tspan>
    </text>
  );
}

// ── Notification icon by type ─────────────────────────────────────────────────
const NOTIF_ICONS = {
  CONFLICT_DETECTED: { icon: TriangleAlert, bg: 'bg-red-50', color: 'text-red-500' },
  APPROVAL_GRANTED:  { icon: CheckCheck,    bg: 'bg-green-50', color: 'text-green-600' },
  PROJECT_SUBMITTED: { icon: Folder,        bg: 'bg-blue-50',  color: 'text-blue-600' },
  PROJECT_UPDATED:   { icon: Folder,        bg: 'bg-blue-50',  color: 'text-blue-600' },
  SYSTEM:            { icon: Clock,         bg: 'bg-slate-100 dark:bg-slate-700', color: 'text-slate-500 dark:text-slate-400' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  // State for projects data
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from backend API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(ENDPOINTS.PROJECTS, {
          params: { limit: 1000 }
        });
        setProjects(res.data.data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Derive stats from projects data
  const activeCount  = projects.filter(p => ['IN_PROGRESS','SCHEDULED','APPROVED','DEPT_NOTIFIED'].includes(p.status)).length;
  const conflictCount = projects.filter(p => p.conflictIds && p.conflictIds.length > 0).length;
  const completedCount = projects.filter(p => p.status === 'COMPLETED').length;
  const draftCount   = projects.filter(p => p.status === 'DRAFT').length;
  const inProgressCount = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const reviewCount  = projects.filter(p => ['UNDER_REVIEW','SUBMITTED','CONFLICT_ANALYSIS'].includes(p.status)).length;

  // Donut data
  const donutData = [
    { name: 'In Progress', value: inProgressCount,   color: '#1668B8' },
    { name: 'Planning',    value: draftCount + reviewCount, color: '#3B82F6' },
    { name: 'Under Review',value: reviewCount,        color: '#F59E0B' },
    { name: 'Completed',   value: completedCount,     color: '#10B981' },
  ];

  // Department activity bar data
  const deptActivity = Object.entries(DEPARTMENT_COLORS).map(([dept, colors]) => ({
    dept: DEPARTMENT_SHORT[dept] || dept.slice(0, 3).toUpperCase(),
    fullName: dept,
    count: projects.filter(p => p.department === dept).length,
    color: colors.hex,
  }));

  // Recent projects (last 5 updated)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  // Recent notifications (last 4)
  const recentNotifs = notifications.slice(0, 4);

  const STAT_CARDS = [
    {
      label: 'Active Projects',
      value: activeCount,
      icon: FolderOpen,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      sub: '+12% vs last month',
      SubIcon: TrendingUp,
      subColor: 'text-green-600',
      highlight: false,
    },
    {
      label: 'Pending Approvals',
      value: 18,
      icon: CheckSquare,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      sub: 'Action Required',
      SubIcon: Clock,
      subColor: 'text-amber-500',
      highlight: false,
    },
    {
      label: 'Conflicts Detected',
      value: conflictCount,
      icon: AlertTriangle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      sub: 'High Priority',
      SubIcon: TriangleAlert,
      subColor: 'text-red-500',
      highlight: true,
    },
    {
      label: 'Departments Active',
      value: 6,
      icon: Building2,
      iconBg: 'bg-primary-50',
      iconColor: 'text-primary-600',
      sub: null,
      SubIcon: null,
      subColor: null,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {STAT_CARDS.map((card, i) => (
              <StatCard key={card.label} {...card} i={i} />
            ))}
          </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Project Status Donut */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Project Status Distribution</h2>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 text-slate-400 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-6">
            {/* Donut */}
            <div className="relative w-44 h-44 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    formatter={(value, name) => [`${value} projects`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{projects.length}</span>
                <span className="text-xs text-slate-400 mt-0.5">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2.5">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{d.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-4">
                    {projects.length > 0 ? Math.round(d.value / projects.length * 100) : 0}%
                    <span className="text-slate-400 font-normal ml-1">({d.value})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Department Activity Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Department Activity</h2>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 text-slate-400 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deptActivity} barSize={24} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="dept"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#CBD5E1' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                formatter={(v, _, props) => [`${v} projects`, props.payload.fullName]}
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {deptActivity.map((d) => (
                  <Cell key={d.dept} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Bottom row: Recent Projects + Recent Notifications ─────────────── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Recent Projects Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Projects</h2>
            <Link
              to={ROUTES.PROJECTS}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {recentProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug line-clamp-1">{project.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{project.id}</p>
                        {project.conflictIds?.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-2xs text-red-500 font-medium mt-0.5">
                            <TriangleAlert className="w-3 h-3" /> Conflict Detected
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <DepartmentTag department={project.department} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={project.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityTag priority={project.priority} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-[60px] bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${project.progressPercent}%`,
                              backgroundColor: project.progressPercent === 100
                                ? '#10B981'
                                : project.progressPercent > 50 ? '#1668B8' : '#60A5FA',
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">{project.progressPercent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Notifications</h2>
            <CheckCheck className="w-4 h-4 text-primary-600 cursor-pointer hover:text-primary-700" />
          </div>

          <div className="flex-1 divide-y divide-slate-50 dark:divide-slate-700 overflow-y-auto">
            {recentNotifs.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-sm">No notifications</div>
            ) : recentNotifs.map((n) => {
              const cfg = NOTIF_ICONS[n.type] || NOTIF_ICONS.SYSTEM;
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 cursor-pointer transition-colors"
                  onClick={() => navigate(ROUTES.NOTIFICATIONS)}
                >
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-1.5" />}
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-3">
            <Link
              to={ROUTES.NOTIFICATIONS}
              className="block text-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors"
            >
              View All Activity
            </Link>
          </div>
        </motion.div>
      </div>
      </>
      )}
    </div>
  );
}

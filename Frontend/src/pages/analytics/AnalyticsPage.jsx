import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Clock, ShieldAlert, Award, 
  IndianRupee, AlertCircle, BarChart3, PieChart as PieIcon, LineChart as LineIcon, Activity 
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import { formatCurrencyShort } from '../../utils/formatters.js';

// Recharts Custom Tooltip
function CustomTooltip({ active, payload, label, formatter }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-slate-100 p-3 rounded-lg border border-slate-800 shadow-modal text-xs space-y-1">
        <p className="font-semibold text-slate-400">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="flex justify-between gap-4">
            <span style={{ color: item.color }}>{item.name}:</span>
            <span className="font-bold">
              {formatter ? formatter(item.value) : item.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for API data
  const [completionData, setCompletionData] = useState(null);
  const [conflictData, setConflictData] = useState(null);
  const [deptPerformance, setDeptPerformance] = useState(null);
  const [budgetData, setBudgetData] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [compRes, confRes, perfRes, budgRes] = await Promise.all([
        axiosInstance.get(ENDPOINTS.ANALYTICS_COMPLETION),
        axiosInstance.get(ENDPOINTS.ANALYTICS_CONFLICT),
        axiosInstance.get(ENDPOINTS.ANALYTICS_DEPT_PERF),
        axiosInstance.get(ENDPOINTS.ANALYTICS_BUDGET),
      ]);

      setCompletionData(compRes.data);
      setConflictData(confRes.data);
      setDeptPerformance(perfRes.data);
      setBudgetData(budgRes.data);
    } catch (err) {
      setError('Failed to fetch analytics metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="text-sm text-slate-500 mt-4">Compiling municipal data and performance insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 max-w-lg mx-auto">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
        <button onClick={fetchAnalytics} className="ml-auto underline font-semibold">Retry</button>
      </div>
    );
  }

  // Formatting donut chart data
  const donutData = [
    { name: 'Completed', value: completionData?.overall || 0, color: '#059669' },
    { name: 'Pending', value: 100 - (completionData?.overall || 0), color: '#CBD5E1' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Analytics &amp; Insights</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review cross-department coordination metrics, budget execution, and conflict mitigation.
          </p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completion Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Project Completion</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{completionData?.overall}%</p>
            <p className="text-[10px] text-slate-500">Municipal baseline rate target: 75%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Conflict Mitigation Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conflict Mitigation Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100">88%</p>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Conflicts resolved before excavation start</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        {/* Budget Utilization Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget Utilization</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {budgetData?.utilizationPercent}%
            </p>
            <p className="text-[10px] text-slate-500">
              {formatCurrencyShort(budgetData?.totalUtilized)} used of {formatCurrencyShort(budgetData?.totalBudget)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Bento Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Project Completion Rate Analysis */}
        <div className="lg:col-span-6 xl:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-card flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Completion Rate Analysis</h3>
            </div>
            <p className="text-2xs text-slate-400 mt-0.5">Summary of overall infrastructure progress and rates by department</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-4">
            {/* Donut representation */}
            <div className="relative w-40 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-850 dark:text-slate-100 leading-none">
                  {completionData?.overall}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                  Completed
                </span>
              </div>
            </div>

            {/* Department mini bar-chart */}
            <div className="flex-1 w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={completionData?.byDepartment || []}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="dept" type="category" style={{ fontSize: '10px', fill: '#94A3B8' }} width={45} />
                  <Tooltip content={<CustomTooltip formatter={(val) => `${val}%`} />} />
                  <Bar dataKey="rate" fill="#0b4f8a" radius={[0, 4, 4, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-semibold text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-350 dark:bg-slate-700"></div>
              <span>Pending review or setup</span>
            </div>
          </div>
        </div>

        {/* 2. Conflict Trend Over Time */}
        <div className="lg:col-span-6 xl:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-card flex flex-col justify-between min-h-[360px]">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <LineIcon className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Conflict Trend Over Time</h3>
              </div>
              <p className="text-2xs text-slate-400 mt-0.5">Correlation of monthly detected vs. successfully resolved spatial overlaps</p>
            </div>
            <span className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 border border-red-100 dark:border-red-900/30">
              <TrendingDown className="w-3.5 h-3.5" />
              -12% this month
            </span>
          </div>

          <div className="w-full h-56 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={conflictData?.trend || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorConflicts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" style={{ fontSize: '10px', fill: '#94A3B8' }} />
                <YAxis style={{ fontSize: '10px', fill: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" name="Conflicts Detected" dataKey="conflicts" stroke="#DC2626" strokeWidth={2} fillOpacity={1} fill="url(#colorConflicts)" />
                <Area type="monotone" name="Resolved" dataKey="resolved" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Department Performance */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-card min-h-[360px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Department Project Operations</h3>
            </div>
            <p className="text-2xs text-slate-400 mt-0.5">Distribution of completed vs. active in-progress projects by department</p>
          </div>

          <div className="w-full h-56 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptPerformance?.departments || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="dept" style={{ fontSize: '10px', fill: '#94A3B8' }} />
                <YAxis style={{ fontSize: '10px', fill: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar name="Completed Projects" dataKey="completed" fill="#059669" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar name="In Progress" dataKey="inProgress" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Budget Allocation vs. Utilization */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-card min-h-[360px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Budget Allocation &amp; Utilization</h3>
            </div>
            <p className="text-2xs text-slate-400 mt-0.5">Comparison of total allocated funding vs. currently utilized cost</p>
          </div>

          <div className="w-full h-56 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetData?.byDepartment || []}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="dept" style={{ fontSize: '10px', fill: '#94A3B8' }} />
                <YAxis style={{ fontSize: '10px', fill: '#94A3B8' }} tickFormatter={(val) => formatCurrencyShort(val)} />
                <Tooltip content={<CustomTooltip formatter={formatCurrencyShort} />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar name="Total Allocated" dataKey="budget" fill="#64748B" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar name="Total Utilized" dataKey="utilized" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

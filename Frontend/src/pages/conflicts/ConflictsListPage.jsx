import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Filter, Search, X, CheckCircle, 
  ArrowRight, Calendar, MapPin, Sparkles, AlertCircle, Info, ChevronRight
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { useAuth } from '../../hooks/useAuth.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import DepartmentTag from '../../components/common/DepartmentTag.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import { RISK_CONFIG, CONFLICT_STATUS } from '../../config/constants.js';

// Helper for rendering circular score gauges
function ScoreGauge({ score, riskLevel, size = 'md' }) {
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#059669'; // low
  if (riskLevel === 'CRITICAL') strokeColor = '#DC2626';
  else if (riskLevel === 'HIGH') strokeColor = '#EA580C';
  else if (riskLevel === 'MEDIUM') strokeColor = '#3B82F6';

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg',
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size] || sizeClasses.md} shrink-0`}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="stroke-slate-100 dark:stroke-slate-800"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="50%"
          cy="50%"
        />
        <circle
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="50%"
          cy="50%"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute font-bold text-slate-800 dark:text-slate-100">{score}</span>
    </div>
  );
}

export default function ConflictsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Core state
  const [conflicts, setConflicts] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected conflict state (for detail slide-out)
  const [selectedConflictId, setSelectedConflictId] = useState(searchParams.get('id') || null);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch conflicts and projects mapping
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch conflicts
      const conflictsRes = await axiosInstance.get(ENDPOINTS.CONFLICTS);
      const conflictsList = conflictsRes.data.data || [];
      setConflicts(conflictsList);

      // Fetch projects to map IDs to titles
      const projectsRes = await axiosInstance.get(ENDPOINTS.PROJECTS, { params: { limit: 100 } });
      const projectsList = projectsRes.data.data || [];
      const mapping = {};
      projectsList.forEach(p => {
        mapping[p.id] = p;
      });
      setProjectsMap(mapping);
    } catch (err) {
      setError('Failed to fetch conflicts data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync selectedConflictId from search param or manual trigger
  useEffect(() => {
    const fetchConflictDetails = async () => {
      if (!selectedConflictId) {
        setSelectedConflict(null);
        return;
      }
      try {
        setDetailsLoading(true);
        const res = await axiosInstance.get(ENDPOINTS.CONFLICT(selectedConflictId));
        setSelectedConflict(res.data);
      } catch (err) {
        setSelectedConflict(null);
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchConflictDetails();
  }, [selectedConflictId]);

  // Handle setting parameters / detail drawer trigger
  const handleSelectConflict = (id) => {
    setSelectedConflictId(id);
    if (id) {
      setSearchParams({ id });
    } else {
      setSearchParams({});
    }
  };

  // Handle Resolve Action
  const handleResolveConflict = async (id) => {
    try {
      setDetailsLoading(true);
      await axiosInstance.post(ENDPOINTS.CONFLICT_RESOLVE(id));
      
      // Update local state
      setConflicts(prev => prev.map(c => c.id === id ? { ...c, status: 'RESOLVED' } : c));
      setSelectedConflict(prev => prev && prev.id === id ? { ...prev, status: 'RESOLVED' } : prev);
    } catch (err) {
      alert('Failed to resolve conflict. Please try again.');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle Acknowledge Action
  const handleAcknowledgeConflict = async (id) => {
    try {
      setDetailsLoading(true);
      // Simulate acknowledging locally
      setConflicts(prev => prev.map(c => c.id === id ? { ...c, status: 'ACKNOWLEDGED' } : c));
      setSelectedConflict(prev => prev && prev.id === id ? { ...prev, status: 'ACKNOWLEDGED' } : prev);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredConflicts = conflicts.filter(c => {
    const matchesSearch = 
      c.locationDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.involvedProjectIds.some(pid => projectsMap[pid]?.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRisk = selectedRisk ? c.riskLevel === selectedRisk : true;
    const matchesDept = selectedDept ? c.departmentsInvolved.includes(selectedDept) : true;
    const matchesStatus = selectedStatus ? c.status === selectedStatus : true;

    return matchesSearch && matchesRisk && matchesDept && matchesStatus;
  });

  const activeConflictsCount = conflicts.filter(c => c.status !== 'RESOLVED').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="text-sm text-slate-500 mt-4">Loading active conflicts and overlap metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
        <button onClick={fetchData} className="ml-auto underline font-semibold">Retry</button>
      </div>
    );
  }

  // Get departments list for filtering
  const allDepartments = Array.from(
    new Set(conflicts.flatMap(c => c.departmentsInvolved))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Conflict Detection</h1>
            <span className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-pulse-ring">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              {activeConflictsCount} Active Conflicts
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Automated spatial and temporal overlap detection between municipal infrastructure projects.
          </p>
        </div>
      </div>

      {/* Filter / Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative min-w-[200px] md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conflicts or roads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Departments</option>
            {allDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || selectedRisk || selectedDept || selectedStatus) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRisk('');
              setSelectedDept('');
              setSelectedStatus('');
            }}
            className="text-xs font-semibold text-primary hover:underline self-end md:self-center"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Grid View / Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Conflict Cards List */}
        <div className={`space-y-3 ${selectedConflictId ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'}`}>
          {filteredConflicts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No conflicts match your search criteria.</p>
              <p className="text-slate-400 text-xs mt-1">Try resetting the filters or modifying your query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConflicts.map((c) => {
                const isSelected = selectedConflictId === c.id;
                const riskConfig = RISK_CONFIG[c.riskLevel] || { color: '#64748B', bg: '#F1F5F9' };

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConflict(c.id)}
                    className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-card flex flex-col gap-4 relative overflow-hidden group hover:shadow-card-hover hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer ${
                      isSelected ? 'border-primary dark:border-primary ring-2 ring-primary/10' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Status / Risk corner badge */}
                    <div className="absolute top-0 right-0 flex items-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-bl bg-slate-100 dark:bg-slate-800 border-l border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        {c.status}
                      </span>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-bl border-l border-b"
                        style={{ 
                          backgroundColor: riskConfig.bg, 
                          color: riskConfig.color, 
                          borderColor: `${riskConfig.color}20` 
                        }}
                      >
                        {riskConfig.label} Risk
                      </span>
                    </div>

                    <div className="flex items-start gap-4 mt-2">
                      <ScoreGauge score={c.conflictScore} riskLevel={c.riskLevel} size="md" />

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {c.conflictType.replace(/_/g, ' ')}
                        </span>
                        
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug mt-0.5 line-clamp-2">
                          {c.involvedProjectIds.map(pid => projectsMap[pid]?.name || pid).join(' vs. ')}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{c.locationDescription}</span>
                        </div>
                      </div>
                    </div>

                    {/* Involved Departments tags */}
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      {c.departmentsInvolved.map((dept) => (
                        <DepartmentTag key={dept} department={dept} size="xs" dot={true} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Slide-in Detail Panel */}
        <AnimatePresence>
          {selectedConflictId && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-modal flex flex-col max-h-[calc(100vh-10rem)] sticky top-24 overflow-hidden"
            >
              {detailsLoading && !selectedConflict ? (
                <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                  <LoadingSpinner />
                  <p className="text-xs text-slate-500 mt-2">Hydrating conflict data...</p>
                </div>
              ) : selectedConflict ? (
                <>
                  {/* Header */}
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30">
                          {selectedConflict.riskLevel} Conflict
                        </span>
                        <span className="text-xs text-slate-400">#{selectedConflict.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1.5 leading-tight">
                        {selectedConflict.roadName} Clash
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedConflict.locationDescription}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleSelectConflict(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scrollable details content */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Gauge metrics */}
                    <div className="flex gap-4 items-center bg-red-50/50 dark:bg-red-950/10 p-4 rounded-xl border border-red-100 dark:border-red-950/20">
                      <ScoreGauge score={selectedConflict.conflictScore} riskLevel={selectedConflict.riskLevel} size="lg" />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Spatial &amp; Temporal Collision
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          A scheduling and placement overlap of {selectedConflict.conflictScore}/100 has been calculated between the departments involved.
                        </p>
                      </div>
                    </div>

                    {/* Comparison between projects */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Conflicting Projects
                      </h4>
                      <div className="flex flex-col gap-3">
                        {selectedConflict.involvedProjects?.map((proj, idx) => (
                          <div 
                            key={proj.id}
                            onClick={() => navigate(`/projects/${proj.id}`)}
                            className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex gap-3 relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-lg"
                            style={{
                              before: {
                                backgroundColor: idx % 2 === 0 ? '#3B82F6' : '#EA580C'
                              }
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-slate-400">{proj.id}</span>
                                <DepartmentTag department={proj.department} size="xs" dot={false} />
                              </div>
                              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mt-1">
                                {proj.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(proj.startDate).toLocaleDateString()} — {new Date(proj.endDate).toLocaleDateString()}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 self-center" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI suggestions */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {selectedConflict.suggestedActions.map((action, idx) => (
                          <li 
                            key={idx} 
                            className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3">
                    {selectedConflict.status !== 'RESOLVED' ? (
                      <>
                        <button
                          onClick={() => handleAcknowledgeConflict(selectedConflict.id)}
                          disabled={selectedConflict.status === 'ACKNOWLEDGED'}
                          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-semibold text-center transition-colors ${
                            selectedConflict.status === 'ACKNOWLEDGED'
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                              : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          {selectedConflict.status === 'ACKNOWLEDGED' ? 'Acknowledged' : 'Acknowledge'}
                        </button>
                        <button
                          onClick={() => handleResolveConflict(selectedConflict.id)}
                          className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors text-center shadow"
                        >
                          Resolve Conflict
                        </button>
                      </>
                    ) : (
                      <div className="w-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-2.5 rounded-lg text-center text-xs font-semibold text-green-700 dark:text-green-400 flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        This conflict was resolved.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  Select a conflict card to view recommendation details.
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

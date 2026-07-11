import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, DollarSign, User, AlertTriangle, ArrowRight,
  CheckCircle, FileText, Clock, ChevronRight, Edit3, Trash2, Crosshair
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { ROUTES } from '../../routes/routeConfig.js';
import { useAuth } from '../../hooks/useAuth.js';
import { can } from '../../utils/permissions.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import PriorityTag from '../../components/common/PriorityTag.jsx';
import DepartmentTag from '../../components/common/DepartmentTag.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { formatCurrencyShort } from '../../utils/formatters.js';
import { formatDate, timeAgo } from '../../utils/dateUtils.js';
import { STATUS_TRANSITIONS, STATUS_CONFIG, MAP_CONFIG, RISK_CONFIG } from '../../config/constants.js';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        // Fetch project
        const projRes = await axiosInstance.get(ENDPOINTS.PROJECT(id));
        const projectData = projRes.data;
        setProject(projectData);
        
        // Fetch related conflicts if any
        if (projectData.conflictIds?.length > 0) {
          const confRes = await axiosInstance.get(ENDPOINTS.CONFLICTS);
          const related = confRes.data.data.filter(c => projectData.conflictIds.includes(c.id));
          setConflicts(related);
        }

        // Fetch audit logs
        const auditRes = await axiosInstance.get(ENDPOINTS.AUDIT_LOGS, { params: { targetId: id } });
        setAuditLogs(auditRes.data.data || []);

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;
  if (error || !project) return <div className="p-8 text-center text-red-500">{error || 'Project not found'}</div>;

  const canEdit = user && can(user, 'project:edit', { project });
  const canDelete = user && can(user, 'project:delete', { project });

  // Safe coordinate array extraction fallback
  const projectCoords = project.coordinates && project.coordinates.length === 2 && !isNaN(project.coordinates[0])
    ? project.coordinates
    : project.location && typeof project.location.lat === 'number' && typeof project.location.lng === 'number'
      ? [project.location.lat, project.location.lng]
      : MAP_CONFIG.CENTER;

  // High risk calculation for the donut
  const maxRisk = conflicts.length > 0 ? Math.max(...conflicts.map(c => c.conflictScore)) : 0;
  const riskColor = maxRisk >= 85 ? '#EF4444' : maxRisk >= 60 ? '#F97316' : maxRisk >= 30 ? '#F59E0B' : '#10B981';
  
  // Timeline steps based on current status
  const allStatuses = Object.keys(STATUS_CONFIG);
  const currentIndex = allStatuses.indexOf(project.status);
  // Simplify steps for visual presentation
  const timelineSteps = ['DRAFT', 'SUBMITTED', 'CONFLICT_ANALYSIS', 'UNDER_REVIEW', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'];
  
  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
            <Link to={ROUTES.PROJECTS} className="hover:text-primary-600 transition-colors">Projects</Link>
            <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]">{project.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h1>
            <span className="text-sm font-medium text-slate-400 mt-2">ID: {project.id}</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <StatusBadge status={project.status} />
            <PriorityTag priority={project.priority} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <Link to={ROUTES.PROJECT_EDIT(project.id)} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors">
              <Edit3 className="w-4 h-4" /> Edit
            </Link>
          )}
          {canDelete && (
            <button className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (Main content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Project Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Project Overview</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              {project.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department</p>
                <DepartmentTag department={project.department} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Budget</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyShort(project.budget)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Budget Utilized</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full" style={{ width: `${project.progressPercent}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{project.progressPercent}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assigned Officer</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {project.createdBy ? project.createdBy.charAt(0) : 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{project.createdBy || 'Unknown'}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Date</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(project.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">End Date</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(project.endDate)}</p>
              </div>
              <div className="col-span-full">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</p>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {project.locationName}
                </div>
              </div>
            </div>
          </div>

          {/* Project Timeline Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Project Timeline</h2>
            
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-100 dark:bg-slate-700 z-0"></div>
              <div 
                className="absolute top-5 left-8 h-0.5 bg-primary-600 z-0 transition-all duration-500" 
                style={{ width: `calc(${Math.max(0, timelineSteps.indexOf(project.status)) / (timelineSteps.length - 1) * 100}% - 2rem)` }}
              ></div>

              <div className="relative z-10 flex justify-between">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = timelineSteps.indexOf(project.status) >= idx;
                  const isCurrent = project.status === step;
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 bg-white dark:bg-slate-900 transition-colors duration-300 ${
                        isCurrent ? 'border-primary-600 text-primary-600 shadow-glow-blue' : 
                        isCompleted ? 'border-primary-600 bg-primary-600 text-white' : 
                        'border-slate-200 dark:border-slate-700 text-slate-300'
                      }`}>
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-medium text-center w-20 ${
                        isCurrent ? 'text-primary-700 font-bold' :
                        isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'
                      }`}>
                        {STATUS_CONFIG[step]?.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Project Location (Map) Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Project Location</h2>
            </div>
            <div className="flex-1 w-full bg-slate-100 dark:bg-slate-700 z-0 relative">
              <MapContainer 
                center={projectCoords} 
                zoom={14} 
                className="w-full h-full"
                zoomControl={false}
              >
                <TileLayer
                  attribution={MAP_CONFIG.TILE_ATTRIBUTION}
                  url={MAP_CONFIG.TILE_URL}
                />
                <CircleMarker 
                  center={projectCoords}
                  radius={12}
                  fillColor="#3B82F6"
                  color="#ffffff"
                  weight={2}
                  fillOpacity={1}
                >
                  <Tooltip>{project.name}</Tooltip>
                </CircleMarker>
                {/* Conflict zone representation if any */}
                {conflicts.length > 0 && (
                  <CircleMarker
                    center={projectCoords}
                    radius={40}
                    fillColor="#EF4444"
                    color="#EF4444"
                    weight={1}
                    fillOpacity={0.15}
                    dashArray="4 4"
                  />
                )}
              </MapContainer>
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          
          {/* Conflict Alert Card (Conditional) */}
          {conflicts.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-red-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Conflict Alert</h2>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded border border-red-200">
                    High Risk
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  {/* Circular Score */}
                  <div className="relative w-16 h-16 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#FEE2E2" strokeWidth="4" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={riskColor} strokeWidth="4" strokeDasharray={`${maxRisk}, 100`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{maxRisk}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1.5">Departments Involved</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[...new Set(conflicts.flatMap(c => c.departmentsInvolved))].filter(d => d !== project.department).map(d => (
                        <DepartmentTag key={d} department={d} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 mb-5">
                  {conflicts.map(c => (
                    <li key={c.id} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-red-500 shrink-0 mt-0.5">!</span>
                      <span>{c.description}</span>
                    </li>
                  ))}
                </ul>

                <Link to={ROUTES.CONFLICT_DETAILS(conflicts[0].id)} className="w-full inline-flex items-center justify-center gap-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors">
                  View Conflict Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Activity Log Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Activity Log</h2>
            </div>
            
            <div className="relative pl-3 space-y-6 before:absolute before:inset-y-2 before:left-3.5 before:w-px before:bg-slate-200 dark:bg-slate-600">
              {auditLogs.length > 0 ? auditLogs.slice(0, 5).map((log, i) => (
                <div key={log.id} className="relative flex gap-3">
                  {/* Dot */}
                  <div className={`w-2 h-2 rounded-full absolute -left-[5px] top-1.5 ring-4 ring-white ${
                    log.action.includes('CREATED') ? 'bg-blue-500' :
                    log.action.includes('UPDATED') ? 'bg-amber-500' :
                    log.action.includes('APPROVED') ? 'bg-green-500' :
                    log.action.includes('CONFLICT') ? 'bg-red-500' : 'bg-slate-400'
                  }`} />
                  
                  <div className="pl-4">
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                      <span className="font-semibold">{log.userName}</span>{' '}
                      <span dangerouslySetInnerHTML={{ __html: log.details }} />
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{timeAgo(log.timestamp)}</p>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-slate-500 dark:text-slate-400 italic pl-4">No activity recorded yet.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

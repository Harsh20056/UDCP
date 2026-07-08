import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Calendar, Building, MessageSquare, AlertCircle, 
  BarChart, Clock, Award, Shield, User, HelpCircle 
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import DepartmentTag from '../../components/common/DepartmentTag.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { formatCurrencyShort } from '../../utils/formatters.js';

export default function CitizenProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axiosInstance.get(ENDPOINTS.PROJECT(id));
      setProject(res.data);
    } catch (err) {
      setError('This project information could not be found. It may be private or not registered.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="text-sm text-slate-500 mt-4">Retrieving project specifications...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link to="/citizen" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-xs">{error || 'Project details unavailable.'}</p>
        </div>
      </div>
    );
  }

  const isRoadClosure = project.name.toLowerCase().includes('road') || project.name.toLowerCase().includes('flyover') || project.name.toLowerCase().includes('resurfacing');

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/citizen')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Project Profile #{project.id}
            </span>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {project.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRoadClosure ? (
            <span className="bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-2 py-0.5 rounded text-xs font-bold">
              Road Closure Active
            </span>
          ) : (
            <StatusBadge status={project.status} size="xs" />
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-6">
        
        {/* Core fields info row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/60">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-bold">Executing Sector</span>
            <div className="mt-0.5"><DepartmentTag department={project.department} size="xs" dot={true} /></div>
          </div>
          
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-bold">Allocated Budget</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {formatCurrencyShort(project.budget)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-bold">Start Schedule</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(project.startDate).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-bold">Target Completion</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {new Date(project.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Project Description</h3>
          <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Progress percent section */}
        <div className="space-y-2.5 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <BarChart className="w-4 h-4 text-primary" />
              Construction Progress
            </span>
            <span className="font-bold text-primary">{project.progressPercent}% Completed</span>
          </div>
          
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${project.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Location maps details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Location Details
          </h3>
          <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/20 text-sm text-slate-700 dark:text-slate-200 leading-normal">
            <p><strong>Address:</strong> {project.location?.address || 'Bhopal Central Segment'}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Coordinates: {project.coordinates ? project.coordinates.join(', ') : (project.location?.lat && project.location?.lng ? `${project.location.lat}, ${project.location.lng}` : 'N/A')}
            </p>
          </div>
        </div>

        {/* Feedback triggers CTA */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-750 dark:text-slate-200">Have questions or complaints?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Submit public feedback directly to the coordinating officers.</p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/citizen/feedback?projectId=${project.id}`)}
            className="w-full sm:w-auto bg-primary text-white text-sm font-semibold py-2 px-5 rounded-lg hover:bg-primary/95 shadow transition-colors flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            Submit Feedback on Project
          </button>
        </div>
      </div>
    </div>
  );
}

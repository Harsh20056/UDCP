import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Calendar, CheckCircle, Sparkles, AlertCircle, Info, ChevronRight 
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import DepartmentTag from '../../components/common/DepartmentTag.jsx';
import { RISK_CONFIG } from '../../config/constants.js';

// Gauge component
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

export default function ConflictDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [conflict, setConflict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchConflict = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(ENDPOINTS.CONFLICT(id));
      setConflict(res.data);
    } catch (err) {
      setError('Conflict details could not be found. It may have been deleted or the ID is invalid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflict();
  }, [id]);

  const handleResolveConflict = async () => {
    try {
      setActionLoading(true);
      await axiosInstance.post(ENDPOINTS.CONFLICT_RESOLVE(id));
      setConflict(prev => prev ? { ...prev, status: 'RESOLVED' } : null);
    } catch (err) {
      alert('Failed to resolve conflict. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcknowledgeConflict = async () => {
    try {
      setActionLoading(true);
      setConflict(prev => prev ? { ...prev, status: 'ACKNOWLEDGED' } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="text-sm text-slate-500 mt-4">Loading conflict information...</p>
      </div>
    );
  }

  if (error || !conflict) {
    return (
      <div className="space-y-4">
        <Link to="/conflicts" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Conflicts
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error || 'Conflict not found'}</p>
        </div>
      </div>
    );
  }

  const riskConfig = RISK_CONFIG[conflict.riskLevel] || { color: '#64748B', bg: '#F1F5F9' };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/conflicts')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30">
                {conflict.riskLevel} Conflict
              </span>
              <span className="text-xs text-slate-400">#{conflict.id}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {conflict.roadName} Clash Details
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            Status: {conflict.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Columns (Details/Projects) */}
        <div className="md:col-span-2 space-y-6">
          {/* Spatial Temporal Impact Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-card space-y-4">
            <div className="flex gap-4 items-center">
              <ScoreGauge score={conflict.conflictScore} riskLevel={conflict.riskLevel} size="lg" />
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Spatial &amp; Temporal Overlap Score
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {conflict.locationDescription}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
              A collision score of <strong>{conflict.conflictScore} out of 100</strong> indicates that multiple departments are executing overlapping construction operations on the same road section within a critical timeframe. Joint coordination is required to prevent re-excavation.
            </p>
          </div>

          {/* Conflicting Projects list */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Involved Project Timelines
            </h3>
            <div className="flex flex-col gap-3">
              {conflict.involvedProjects?.map((proj, idx) => (
                <div 
                  key={proj.id}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-card hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex justify-between items-center relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-xl"
                  style={{
                    before: {
                      backgroundColor: idx % 2 === 0 ? '#3B82F6' : '#EA580C'
                    }
                  }}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">{proj.id}</span>
                      <DepartmentTag department={proj.department} size="xs" dot={false} />
                    </div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {proj.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(proj.startDate).toLocaleDateString()} — {new Date(proj.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI recommendations / actions */}
        <div className="space-y-6">
          {/* AI suggestion panel */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
              AI Suggestions
            </h3>
            <ul className="space-y-3">
              {conflict.suggestedActions.map((action, idx) => (
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

          {/* Action trigger panel */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Resolution Controls
            </h3>
            {conflict.status !== 'RESOLVED' ? (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleAcknowledgeConflict}
                  disabled={conflict.status === 'ACKNOWLEDGED' || actionLoading}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold text-center transition-colors ${
                    conflict.status === 'ACKNOWLEDGED'
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {conflict.status === 'ACKNOWLEDGED' ? 'Conflict Acknowledged' : 'Acknowledge Overlap'}
                </button>
                <button
                  onClick={handleResolveConflict}
                  disabled={actionLoading}
                  className="w-full px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors text-center shadow"
                >
                  Mark as Resolved
                </button>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-4 rounded-lg text-center text-xs font-semibold text-green-700 dark:text-green-400 flex flex-col items-center gap-1.5">
                <CheckCircle className="w-5 h-5" />
                <span>This coordination conflict has been resolved.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

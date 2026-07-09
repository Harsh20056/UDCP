import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, ThumbsUp, HelpCircle, MessageSquare, AlertTriangle, ShieldAlert,
  Calendar, Building2, User, ChevronDown, ChevronUp, AlertCircle, Info, AlertOctagon 
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { useAuth } from '../../hooks/useAuth.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import DepartmentTag from '../../components/common/DepartmentTag.jsx';
import PriorityTag from '../../components/common/PriorityTag.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [approvals, setApprovals] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Local state for comments input (keyed by approval.id)
  const [reviewerNotes, setReviewerNotes] = useState({});
  // Track action loadings
  const [submittingId, setSubmittingId] = useState(null);

  // Filter tabs: 'ALL', 'SUBMITTED', 'UNDER_REVIEW', 'ESCALATED', 'APPROVED', 'REJECTED'
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch approvals
      const approvalsRes = await axiosInstance.get(ENDPOINTS.APPROVALS);
      setApprovals(approvalsRes.data.data || []);

      // Fetch conflicts to match alerts
      const conflictsRes = await axiosInstance.get(ENDPOINTS.CONFLICTS);
      setConflicts(conflictsRes.data.data || []);
    } catch (err) {
      setError('Failed to load pending approvals. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (approval) => {
    const comment = reviewerNotes[approval.id] || '';
    try {
      setSubmittingId(approval.id);
      
      // POST /approvals/:projectId/approve
      await axiosInstance.post(ENDPOINTS.APPROVAL_APPROVE(approval.projectId), {
        comment,
        reviewedBy: user?.name || 'Approver Office',
      });

      // Update state locally
      setApprovals(prev => prev.map(a => {
        if (a.id === approval.id) {
          const timestamp = new Date().toISOString();
          return {
            ...a,
            status: 'APPROVED',
            currentStage: 'APPROVED',
            comment,
            history: [
              ...(Array.isArray(a.history) ? a.history : []),
              { stage: 'APPROVED', actor: user?.name || 'Approver', action: 'Approved', timestamp, comment }
            ]
          };
        }
        return a;
      }));

      // Clear note
      setReviewerNotes(prev => ({ ...prev, [approval.id]: '' }));
    } catch (err) {
      alert('Approval request failed. Please try again.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (approval) => {
    const comment = reviewerNotes[approval.id] || '';
    if (!comment.trim()) {
      alert('Reviewer Note is required for rejecting a project.');
      return;
    }

    try {
      setSubmittingId(approval.id);

      // POST /approvals/:projectId/reject
      await axiosInstance.post(ENDPOINTS.APPROVAL_REJECT(approval.projectId), {
        comment,
        reviewedBy: user?.name || 'Approver Office',
      });

      // Update state locally
      setApprovals(prev => prev.map(a => {
        if (a.id === approval.id) {
          const timestamp = new Date().toISOString();
          return {
            ...a,
            status: 'REJECTED',
            currentStage: 'REJECTED',
            comment,
            history: [
              ...(Array.isArray(a.history) ? a.history : []),
              { stage: 'REJECTED', actor: user?.name || 'Approver', action: 'Rejected', timestamp, comment }
            ]
          };
        }
        return a;
      }));

      // Clear note
      setReviewerNotes(prev => ({ ...prev, [approval.id]: '' }));
    } catch (err) {
      alert('Rejection request failed. Please try again.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleEscalate = async (approval) => {
    // Escalate locally (simulate)
    try {
      setSubmittingId(approval.id);
      setApprovals(prev => prev.map(a => {
        if (a.id === approval.id) {
          const timestamp = new Date().toISOString();
          return {
            ...a,
            status: 'PENDING',
            currentStage: 'UNDER_REVIEW', // stay under review
            comment: 'Escalated to Board for high-level spatial coordination.',
            history: [
              ...(Array.isArray(a.history) ? a.history : []),
              { stage: 'UNDER_REVIEW', actor: user?.name || 'Approver', action: 'Escalated to Board', timestamp, comment: 'Escalated to Board due to unresolved conflicts.' }
            ]
          };
        }
        return a;
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  // Stepper nodes configuration helper
  const renderStepper = (history = [], currentStatus) => {
    const stages = [
      { key: 'SUBMITTED', label: 'Submitted' },
      { key: 'CONFLICT_ANALYSIS', label: 'Conflict Analysis' },
      { key: 'DEPT_NOTIFIED', label: 'Notified' },
      { key: 'UNDER_REVIEW', label: 'Under Review' },
      { key: 'FINAL_STAGE', label: currentStatus === 'REJECTED' ? 'Rejected' : 'Approved' }
    ];

    // Determine completion index of historical stages
    const historyStages = history.map(h => h.stage);

    return (
      <div className="w-full max-w-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mt-2">
        <div className="flex items-center justify-between relative">
          {/* Progress bar line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>

          {stages.map((stage, idx) => {
            let isCompleted = false;
            let isActive = false;
            let isRejected = false;

            if (stage.key === 'FINAL_STAGE') {
              if (currentStatus === 'APPROVED') isCompleted = true;
              if (currentStatus === 'REJECTED') {
                isRejected = true;
                isCompleted = true;
              }
            } else {
              isCompleted = historyStages.includes(stage.key);
              isActive = !isCompleted && historyStages.length === idx;
            }

            return (
              <div key={stage.key} className="relative z-10 flex flex-col items-center group">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-white font-bold transition-all ${
                    isRejected 
                      ? 'bg-red-500 border-red-600'
                      : isCompleted
                      ? 'bg-primary dark:bg-primary border-primary'
                      : isActive
                      ? 'bg-white border-2 border-primary text-primary ring-2 ring-primary/20 dark:bg-slate-950'
                      : 'bg-slate-200 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {isRejected ? (
                    <X className="w-3.5 h-3.5 text-white" />
                  ) : isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  ) : null}
                </div>
                <span className={`text-[10px] mt-1 absolute -bottom-5 whitespace-nowrap font-medium ${
                  isRejected ? 'text-red-500 font-bold' : isCompleted || isActive ? 'text-primary dark:text-primary-400 font-semibold' : 'text-slate-400'
                }`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Padding bottom to prevent label overlap with outer layouts */}
        <div className="h-4"></div>
      </div>
    );
  };

  // Filter approvals based on tab selection and search query
  const filteredApprovals = approvals.filter(a => {
    let matchTab = true;
    if (activeTab === 'SUBMITTED') matchTab = a.status === 'PENDING' && a.currentStage === 'SUBMITTED';
    else if (activeTab === 'UNDER_REVIEW') matchTab = a.status === 'PENDING' && a.currentStage === 'UNDER_REVIEW';
    else if (activeTab === 'APPROVED') matchTab = a.status === 'APPROVED';
    else if (activeTab === 'REJECTED') matchTab = a.status === 'REJECTED';

    const query = searchQuery.toLowerCase().trim();
    const matchSearch = query
      ? a.projectName.toLowerCase().includes(query) || 
        a.department.toLowerCase().includes(query) || 
        (a.comment && a.comment.toLowerCase().includes(query))
      : true;

    return matchTab && matchSearch;
  });

  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="text-sm text-slate-500 mt-4">Loading pending review workflows...</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-4 mb-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Pending Approvals</h1>
          <span className="bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {pendingApprovalsCount} Pending Action
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Review department submissions, evaluate detected spatial pipeline conflicts, and authorize projects.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((tab) => {
          const isActive = activeTab === tab;
          const count = approvals.filter(a => {
            if (tab === 'ALL') return true;
            if (tab === 'SUBMITTED') return a.status === 'PENDING' && a.currentStage === 'SUBMITTED';
            if (tab === 'UNDER_REVIEW') return a.status === 'PENDING' && a.currentStage === 'UNDER_REVIEW';
            if (tab === 'APPROVED') return a.status === 'APPROVED';
            if (tab === 'REJECTED') return a.status === 'REJECTED';
            return false;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors relative ${
                isActive 
                  ? 'border-primary text-primary dark:text-primary-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.replace(/_/g, ' ')}
              <span className="ml-1.5 px-1.5 py-0.25 text-[10px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex flex-col space-y-5">
        {filteredApprovals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No projects in this category.</p>
          </div>
        ) : (
          filteredApprovals.map((approval) => {
            // Find active conflicts for this project
            const activeProjectConflicts = conflicts.filter(
              c => c.involvedProjectIds.includes(approval.projectId) && c.status !== 'RESOLVED'
            );
            const hasConflict = activeProjectConflicts.length > 0;
            const noteValue = reviewerNotes[approval.id] || '';

            return (
              <div 
                key={approval.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border p-6 flex flex-col lg:flex-row gap-6 items-start hover:shadow-card transition-all relative ${
                  hasConflict && approval.status === 'PENDING'
                    ? 'border-red-200 dark:border-red-950/30 bg-red-50/5 dark:bg-red-950/5 ring-1 ring-red-100 dark:ring-red-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Conflict warning indicator */}
                {hasConflict && approval.status === 'PENDING' && (
                  <div className="absolute -top-3 left-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-red-600 text-white shadow-sm border border-red-500">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      Conflict Detected ({activeProjectConflicts.length})
                    </span>
                  </div>
                )}

                {/* Left Area: Project details */}
                <div className="flex-1 w-full space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
                        {approval.projectName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <DepartmentTag department={approval.department} size="xs" dot={true} />
                        <PriorityTag priority={approval.priority} size="xs" />
                        <StatusBadge status={approval.status === 'PENDING' ? approval.currentStage : approval.status} size="xs" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-slate-400 leading-none">Submitted by</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">Staff Officer</p>
                      </div>
                    </div>
                  </div>

                  {/* Progressive Stepper */}
                  {renderStepper(approval.history, approval.status)}

                  {/* Conflict alert warnings box */}
                  {hasConflict && approval.status === 'PENDING' && (
                    <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30 rounded-lg p-4 space-y-3">
                      {activeProjectConflicts.map((c) => (
                        <div key={c.id} className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-red-800 dark:text-red-400">
                              Overlap Detected: {c.locationDescription}
                            </h4>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              Overlap conflict score: <strong>{c.conflictScore}/100</strong>. Suggested action: {c.suggestedActions[0]}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Approved/Rejected state notes */}
                  {approval.comment && (
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      <strong>Review Note: </strong> {approval.comment}
                      <p className="text-[10px] text-slate-400 mt-1">Reviewed by: {approval.reviewedBy || 'Approver'} at {new Date(approval.reviewedAt || approval.submittedAt).toLocaleDateString()}</p>
                    </div>
                  )}

                  {/* Textarea review note (Only if PENDING) */}
                  {approval.status === 'PENDING' && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                        Reviewer Decision Comments {hasConflict && <span className="text-red-500">(Required for rejecting or board escalation)</span>}
                      </label>
                      <textarea
                        value={noteValue}
                        onChange={(e) => setReviewerNotes(prev => ({ ...prev, [approval.id]: e.target.value }))}
                        placeholder="Add review notes, specify approval conditions, or justification for rejection..."
                        rows={2}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Right Area: Action button controls (Only if PENDING) */}
                {approval.status === 'PENDING' && (
                  <div className="lg:w-48 w-full flex flex-row lg:flex-col gap-2 shrink-0 self-stretch justify-end lg:justify-start lg:pt-4 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 lg:pl-6 pt-4 mt-2">
                    <button
                      onClick={() => handleApprove(approval)}
                      disabled={submittingId === approval.id}
                      className="flex-1 bg-green-600 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 h-10"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    
                    <button
                      onClick={() => handleReject(approval)}
                      disabled={submittingId === approval.id}
                      className="flex-1 border border-red-200 text-red-650 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 h-10"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>

                    {hasConflict && (
                      <button
                        onClick={() => handleEscalate(approval)}
                        disabled={submittingId === approval.id}
                        className="flex-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold text-xs py-2 text-center underline lg:mt-2"
                      >
                        Escalate to Board
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

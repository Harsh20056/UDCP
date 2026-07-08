import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  History, Search, Filter, Download, ArrowUpDown, ChevronLeft, ChevronRight, 
  Info, ShieldAlert, LogIn, PlusCircle, CheckCircle2, AlertTriangle, Trash2, Edit 
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { timeAgo } from '../../utils/dateUtils.js';

// Action icon mapping helper
const ACTION_ICONS = {
  USER_LOGIN:       { icon: LogIn,        color: 'text-slate-500 bg-slate-50 dark:bg-slate-800' },
  PROJECT_APPROVED: { icon: CheckCircle2,  color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
  PROJECT_REJECTED: { icon: ShieldAlert,   color: 'text-red-600 bg-red-50 dark:bg-red-950/20' },
  PROJECT_CREATED:  { icon: PlusCircle,     color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
  PROJECT_UPDATED:  { icon: Edit,           color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
  PROJECT_DELETED:  { icon: Trash2,         color: 'text-red-500 bg-red-50 dark:bg-red-950/20' },
  CONFLICT_RESOLVED:{ icon: CheckCircle2,  color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
  USER_APPROVED:    { icon: CheckCircle2,  color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
  USER_REJECTED:    { icon: ShieldAlert,   color: 'text-red-650 bg-red-50 dark:bg-red-950/20' },
};

// Users details cache for mock avatars and designations
const USER_METADATA = {
  'usr-001': { role: 'City Manager', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8jxeiTrSpDA2EWPxvl4qxlg6IiGR_F6SXcMDy6UDL6FPxyvwfoHFjaNQc64ZCnccA6QL8HHo1NfXxiH34NmMGnlwWolT9UI16eXVsoai4sAr9Su6FIV1aPiuEPt814NgH_ou4rn7jcHklDAwXAi1iPs7a86xybaEkudwhp176P4TSoBnl6tPHQfNSmod94Oujf2SjuRlyohmWK-KV5uUemkOP6E57H04guAfnikyKEolxXjpOMcMT' },
  'usr-002': { role: 'Senior Project Planner', avatar: null },
  'usr-003': { role: 'Chief Approval Officer', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuM59K43aJCg4TLTAFTW6LR-jK2IvBsj-NnHhkFV3LPmf9jHIgy8uVGhnpHeOnAStkxvDsrCHjXFEG_u0DDarjnEISIMblLqE6UmnbnRTzKXgc6BPb8qTwz7xdB7Qk3Ye8Gq8u1SQrUK9AhlgzthPQEC1CEtYA6ltiYZ0FVkZsUs3GLYUZTQRSczakuphn6nTrHjFqV-ixjh9Z-LkiBTwn5JySccqFWxR6h08HbR1Oe7c9P2InVAY0' },
  'usr-004': { role: 'Field Engineer II', avatar: null },
};

export default function AuditLogsPage() {
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get('search') || '';
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters state
  const [page, setPage] = useState(1);
  const [searchUser, setSearchUser] = useState(querySearch);
  const [appliedSearchUser, setAppliedSearchUser] = useState(querySearch);
  const [actionType, setActionType] = useState('');
  
  // Expanded log details state
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 10,
      };

      if (appliedSearchUser) params.user = appliedSearchUser;
      if (actionType) params.action = actionType;

      const res = await axiosInstance.get(ENDPOINTS.AUDIT_LOGS, { params });
      
      setLogs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError('Failed to fetch system audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sync search query parameter from URL with debounce
  useEffect(() => {
    const querySearch = searchParams.get('search') || '';
    setSearchUser(querySearch);
    
    const handler = setTimeout(() => {
      setAppliedSearchUser(querySearch);
      setPage(1);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchParams]);

  useEffect(() => {
    fetchLogs();
  }, [page, actionType, appliedSearchUser]); // Search query uses trigger or separate manual button for typing latency

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearchUser(searchUser);
  };

  // Mock export download triggers a file download of current logs
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `udcp_audit_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Audit Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authorized track of all system modifications, project workflows, and approval decisions.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center">
          {/* User Search Input */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user or operator ID..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Action Type Dropdown */}
          <select
            value={actionType}
            onChange={(e) => {
              setActionType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Action Types</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="PROJECT_CREATED">Project Creation</option>
            <option value="PROJECT_APPROVED">Project Approval</option>
            <option value="PROJECT_REJECTED">Project Rejection</option>
            <option value="PROJECT_UPDATED">Project Updates</option>
            <option value="PROJECT_DELETED">Project Deletions</option>
            <option value="CONFLICT_RESOLVED">Conflict Resolutions</option>
            <option value="USER_APPROVED">Staff Approvals</option>
          </select>

          <button
            type="submit"
            className="bg-primary text-white text-xs font-semibold py-1.5 px-4 rounded-lg hover:bg-primary/95 shadow-sm transition-colors"
          >
            Apply Search
          </button>

          {(searchUser || appliedSearchUser || actionType) && (
            <button
              type="button"
              onClick={() => {
                setSearchUser('');
                setAppliedSearchUser('');
                setActionType('');
                setPage(1);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Main Table logs container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-card">
        {loading && logs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="text-xs text-slate-500 mt-2">Loading audit streams...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <History className="w-8 h-8 text-slate-350 mx-auto mb-2" />
            <p className="font-semibold text-slate-650 dark:text-slate-400">No logs found matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px] text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4 w-40">Timestamp</th>
                  <th className="py-3 px-4 w-60">User / Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource / ID</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const config = ACTION_ICONS[log.action] || { icon: Info, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' };
                  const Icon = config.icon;
                  const meta = USER_METADATA[log.userId] || { role: 'System Operator', avatar: null };

                  return (
                    <>
                      <tr 
                        key={log.id} 
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/20 cursor-pointer transition-colors ${
                          isExpanded ? 'bg-slate-50/30 dark:bg-slate-950/10' : ''
                        }`}
                      >
                        <td className="py-4 px-4 text-slate-450 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {meta.avatar ? (
                              <img 
                                src={meta.avatar} 
                                alt={log.userName} 
                                className="w-6 h-6 rounded-full object-cover border border-slate-250 dark:border-slate-700" 
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-150 dark:bg-slate-850 flex items-center justify-center font-bold text-[9px] text-slate-500">
                                {log.userName.split(' ').map(n=>n[0]).slice(0,2).join('')}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-slate-850 dark:text-slate-200 truncate">{log.userName}</span>
                              <span className="text-[9px] text-slate-400 truncate">{meta.role}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-850 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${config.color.split(' ')[1]}`}>
                              <Icon className={`w-3.5 h-3.5 ${config.color.split(' ')[0]}`} />
                            </div>
                            <span>{log.action.replace(/_/g, ' ')}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-primary dark:text-primary-400 font-semibold">
                          {log.resourceId || log.resource.toUpperCase()}
                        </td>

                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400 leading-normal max-w-xs truncate">
                          {log.details}
                        </td>
                      </tr>

                      {/* Expanded Change Details Pane */}
                      {isExpanded && (
                        <tr key={`${log.id}-expand`} className="bg-slate-50/20 dark:bg-slate-950/5">
                          <td colSpan={5} className="py-3 px-12">
                            <div className="bg-slate-50/70 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-150 dark:border-slate-800 ml-6 relative before:absolute before:-left-5 before:top-4 before:w-5 before:h-px before:bg-slate-200 dark:before:bg-slate-800 after:absolute after:-left-5 after:-top-4 after:w-px after:h-8 after:bg-slate-200 dark:after:bg-slate-800">
                              <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-2">Detailed Log Context</h4>
                              <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                                <p><strong>Audit Log Entry:</strong> {log.id}</p>
                                <p><strong>Operator ID:</strong> {log.userId}</p>
                                <p><strong>Action Scope:</strong> {log.resource} Resource context mapping</p>
                                <p><strong>Details Payload:</strong> {log.details}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
            <span className="text-slate-450 text-[11px]">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} logs
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-7 h-7 rounded text-xs font-semibold border flex items-center justify-center transition-all ${
                    page === pNum
                      ? 'bg-primary border-primary text-white'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400'
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

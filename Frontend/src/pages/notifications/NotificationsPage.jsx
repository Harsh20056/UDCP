import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Bell, Mail, MessageSquare, AlertTriangle, CheckCircle, Clock, Info, CheckCheck 
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications.js';
import axiosInstance from '../../api/axiosInstance.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { timeAgo } from '../../utils/dateUtils.js';

// Icons configuration mapping
const NOTIF_CONFIG = {
  CONFLICT_DETECTED: { icon: AlertTriangle, bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-600 dark:text-red-400' },
  APPROVAL_GRANTED:  { icon: CheckCircle,    bg: 'bg-green-50 dark:bg-green-950/20', text: 'text-green-600 dark:text-green-400' },
  APPROVAL_REJECTED: { icon: AlertTriangle, bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-600 dark:text-red-400' },
  PROJECT_SUBMITTED: { icon: Info,          bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400' },
  PROJECT_UPDATED:   { icon: Info,          bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400' },
  SYSTEM:            { icon: Clock,         bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400' },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { 
    notifications, 
    unreadCount, 
    loading: ctxLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  // Local state for dispatch history
  const [commsLog, setCommsLog] = useState([]);
  const [commsLoading, setCommsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  // Fetch email/SMS simulated log
  useEffect(() => {
    const fetchCommsLog = async () => {
      try {
        setCommsLoading(true);
        const res = await axiosInstance.get('/notifications/email-sms-log');
        setCommsLog(res.data || []);
      } catch (err) {
        console.error('Failed to fetch communications log', err);
      } finally {
        setCommsLoading(false);
      }
    };
    fetchCommsLog();
  }, []);

  // Filter tab and search query mapping
  const filteredNotifications = notifications.filter(n => {
    let matchTab = true;
    if (activeTab === 'UNREAD') matchTab = !n.read;
    else if (activeTab === 'APPROVALS') {
      matchTab = ['APPROVAL_GRANTED', 'APPROVAL_REJECTED', 'PROJECT_SUBMITTED', 'PROJECT_UPDATED'].includes(n.type);
    }
    else if (activeTab === 'CONFLICTS') matchTab = n.type === 'CONFLICT_DETECTED';
    else if (activeTab === 'DEADLINES') {
      matchTab = n.title.toLowerCase().includes('deadline') || n.message.toLowerCase().includes('deadline');
    }

    const query = searchQuery.toLowerCase().trim();
    const matchSearch = query 
      ? n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query)
      : true;

    return matchTab && matchSearch;
  });

  // Handle clicking a notification item
  const handleNotificationClick = async (n) => {
    // 1. Mark as read
    if (!n.read) {
      await markAsRead(n.id);
    }
    // 2. Navigate based on target resource
    if (n.conflictId) {
      navigate(`/conflicts?id=${n.conflictId}`);
    } else if (n.projectId) {
      navigate(`/projects/${n.projectId}`);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with coordinate dispatch logs, conflict alerts, and approval workflows.
          </p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAll}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {['ALL', 'UNREAD', 'APPROVALS', 'CONFLICTS', 'DEADLINES'].map(tab => {
          const isActive = activeTab === tab;
          const count = notifications.filter(n => {
            if (tab === 'ALL') return true;
            if (tab === 'UNREAD') return !n.read;
            if (tab === 'APPROVALS') return ['APPROVAL_GRANTED', 'APPROVAL_REJECTED', 'PROJECT_SUBMITTED', 'PROJECT_UPDATED'].includes(n.type);
            if (tab === 'CONFLICTS') return n.type === 'CONFLICT_DETECTED';
            if (tab === 'DEADLINES') return n.title.toLowerCase().includes('deadline') || n.message.toLowerCase().includes('deadline');
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

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notification list */}
        <div className="lg:col-span-8 space-y-3">
          {ctxLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <LoadingSpinner />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600 dark:text-slate-400">No notifications in this folder.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-card divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredNotifications.map((n) => {
                const conf = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.SYSTEM;
                const Icon = conf.icon;

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 flex gap-4 transition-colors cursor-pointer relative hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                      !n.read 
                        ? 'bg-slate-50/50 dark:bg-slate-950/20 border-l-2 border-primary' 
                        : 'pl-[18px]' // compensate for border thickness to align items
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!n.read && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}

                    {/* Icon wrapper */}
                    <div className={`w-9 h-9 rounded-full ${conf.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${conf.text}`} />
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className={`text-sm font-semibold text-slate-800 dark:text-slate-200 truncate ${!n.read ? 'font-bold' : ''}`}>
                          {n.title}
                        </h3>
                        <span className="text-xs text-slate-400 whitespace-nowrap mt-0.5">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed truncate">
                        {n.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Simulated Comms dispatch history log */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-card">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Simulated Communications Log</h3>
              <p className="text-xs text-slate-400 mt-0.5">Dispatched SMS and email alert notifications history</p>
            </div>
            
            <div className="p-2 space-y-2">
              {commsLoading && commsLog.length === 0 ? (
                <div className="py-8 flex justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : commsLog.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No communications logs found.</p>
              ) : (
                commsLog.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        {log.channel === 'EMAIL' ? (
                          <Mail className="w-3.5 h-3.5" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5" />
                        )}
                        <span className="text-xs font-semibold truncate max-w-[120px]">{log.to}</span>
                      </div>
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        Simulated
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-snug line-clamp-1">
                      {log.subject}
                    </p>
                    <p className="text-xs text-slate-400 leading-normal line-clamp-2 mt-1">
                      {log.preview}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Sent {timeAgo(log.sentAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

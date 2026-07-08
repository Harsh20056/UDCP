import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Building, MessageSquare, AlertCircle, Eye, Info } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import DepartmentTag from '../../components/common/DepartmentTag.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { ROUTES } from '../../routes/routeConfig.js';

export default function CitizenPortalPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const fetchPublicProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchQuery) params.search = searchQuery;

      const res = await axiosInstance.get(ENDPOINTS.CITIZEN_PROJECTS, { params });
      setProjects(res.data.data || []);
    } catch (err) {
      setError('Failed to load ongoing municipal projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicProjects();
  }, [searchQuery]);

  // Unique list of departments from returned projects for filtering
  const departments = Array.from(new Set(projects.map(p => p.department)));

  const filteredProjects = projects.filter(p => {
    if (selectedDept) return p.department === selectedDept;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hero Welcome banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Ongoing Projects Near You</h1>
          <p className="text-xs text-slate-100/90 leading-relaxed">
            Welcome to the Bhopal Infrastructure Transparency Dashboard. View live coordination schedules, road closures, and municipal progress. Your feedback helps us build a smarter city.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center justify-end pointer-events-none pr-10">
          <Building className="w-48 h-48" />
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, segments or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-150 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-400"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
          <button
            onClick={() => setSelectedDept('')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all shrink-0 ${
              selectedDept === ''
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-50'
            }`}
          >
            All Sectors
          </button>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all shrink-0 ${
                selectedDept === dept
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-50'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-750 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-xs">{error}</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
          <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-650 dark:text-slate-400 text-xs">No active public works match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((p) => {
            const isRoadClosure = p.name.toLowerCase().includes('road') || p.name.toLowerCase().includes('flyover') || p.name.toLowerCase().includes('resurfacing');
            
            return (
              <article
                key={p.id}
                onClick={() => navigate(`/citizen/projects/${p.id}`)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-5 flex flex-col justify-between hover:shadow-card-hover hover:border-slate-300 transition-all cursor-pointer group min-h-[180px]"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <DepartmentTag department={p.department} size="xs" dot={true} />
                    
                    {isRoadClosure ? (
                      <span className="bg-red-50 text-red-750 px-2 py-0.5 rounded-full border border-red-100 text-[10px] font-bold">
                        Road Closure Active
                      </span>
                    ) : (
                      <StatusBadge status={p.status} size="xs" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-455 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(p.startDate).toLocaleDateString()} — {new Date(p.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{p.location?.address || 'Bhopal Core'}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <Link
        to={ROUTES.CITIZEN_FEEDBACK}
        className="fixed bottom-20 right-6 bg-primary hover:bg-primary/95 text-white hover:scale-105 transition-all shadow-modal rounded-full px-5 py-3 flex items-center gap-2 z-40 border border-primary-500"
      >
        <MessageSquare className="w-4.5 h-4.5" />
        <span className="text-xs font-bold">Submit Feedback</span>
      </Link>
    </div>
  );
}

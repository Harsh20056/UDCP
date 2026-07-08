import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Filter, Plus, MoreVertical, MapPin,
  Calendar, DollarSign, User as UserIcon, LayoutGrid, List
} from 'lucide-react';
import { MOCK_PROJECTS } from '../../api/mock/data/projects.js';
import { ROUTES } from '../../routes/routeConfig.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import PriorityTag from '../../components/common/PriorityTag.jsx';
import DepartmentTag from '../../components/common/DepartmentTag.jsx';
import { DEPARTMENT_LIST, STATUS_CONFIG, PRIORITY_CONFIG } from '../../config/constants.js';
import { formatCurrencyShort } from '../../utils/formatters.js';
import { formatDate } from '../../utils/dateUtils.js';
import { useAuth } from '../../hooks/useAuth.js';
import { can } from '../../utils/permissions.js';

export default function ProjectsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter projects
  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter ? p.department === deptFilter : true;
      const matchStatus = statusFilter ? p.status === statusFilter : true;
      const matchPriority = priorityFilter ? p.priority === priorityFilter : true;
      return matchSearch && matchDept && matchStatus && matchPriority;
    });
  }, [search, deptFilter, statusFilter, priorityFilter]);

  // Pagination logic
  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const canCreate = user && can(user.role, 'project', 'create');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Projects" 
          subtitle="Manage and coordinate cross-departmental infrastructure initiatives." 
          breadcrumbs={[{ label: 'Dashboard', path: ROUTES.DASHBOARD }, { label: 'Projects' }]}
        />
        {canCreate && (
          <Link
            to={ROUTES.PROJECTS_NEW}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:bg-slate-900 transition-colors"
            />
          </div>
          
          {/* Department */}
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:bg-slate-900 transition-colors"
          >
            <option value="">Department (All)</option>
            {DEPARTMENT_LIST.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:bg-slate-900 transition-colors"
          >
            <option value="">Status (All)</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:bg-slate-900 transition-colors"
          >
            <option value="">Priority (All)</option>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl overflow-hidden"
      >
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Timeline</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {currentProjects.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No projects found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  currentProjects.map(project => (
                    <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors group">
                      <td className="px-6 py-4">
                        <Link to={`/projects/${project.id}`} className="font-semibold text-slate-900 dark:text-slate-100 hover:text-primary-600 transition-colors block mb-1">
                          {project.name}
                        </Link>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{project.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <DepartmentTag department={project.department} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={project.status} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <PriorityTag priority={project.priority} size="sm" />
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrencyShort(project.budget)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                            {project.createdBy.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300">{project.createdBy}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 rounded-lg transition-colors"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-800/50">
            {currentProjects.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                No projects found matching the selected filters.
              </div>
            ) : (
              currentProjects.map(project => (
                <div key={project.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <DepartmentTag department={project.department} size="sm" />
                    <button onClick={() => navigate(`/projects/${project.id}`)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300"><MoreVertical className="w-4 h-4" /></button>
                  </div>
                  <Link to={`/projects/${project.id}`} className="font-semibold text-lg text-slate-900 dark:text-slate-100 hover:text-primary-600 block mb-1 line-clamp-1">
                    {project.name}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{project.id}</p>
                  
                  <div className="flex gap-2 mb-4">
                    <StatusBadge status={project.status} size="sm" />
                    <PriorityTag priority={project.priority} size="sm" />
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span>{formatCurrencyShort(project.budget)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-slate-100">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-100">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium text-slate-900 dark:text-slate-100">{totalItems}</span> projects
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

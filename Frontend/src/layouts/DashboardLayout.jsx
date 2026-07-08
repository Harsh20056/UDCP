import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';

// Map path segments to human-readable titles
const PAGE_TITLES = {
  '/dashboard':    'Operations Dashboard',
  '/projects':     'Projects',
  '/map':          'GIS Map',
  '/conflicts':    'Conflict Detection',
  '/approvals':    'Approvals',
  '/notifications':'Notifications',
  '/analytics':    'Analytics & Insights',
  '/audit-logs':   'Audit Logs',
  '/settings':     'Settings',
};

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const segment = '/' + pathname.split('/')[1];
  const title = PAGE_TITLES[segment] || 'UDCP';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 dark:bg-gray-950 flex">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <Topbar title={title} />
        <main className="flex-1 pt-16 overflow-auto">
          <div className="p-6 max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

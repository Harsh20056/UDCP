import { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, Filter, Search, X, Check, Mail, Calendar, DollarSign, 
  AlertTriangle, Plus, Minus, Info, ArrowRight, RefreshCw, AlertOctagon, HelpCircle, Eye
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { ROUTES } from '../../routes/routeConfig.js';
import { ThemeContext } from '../../context/ThemeContext.jsx';
import { MAP_CONFIG, DEPARTMENT_COLORS, STATUS_CONFIG, RISK_CONFIG } from '../../config/constants.js';
import { formatCurrencyShort } from '../../utils/formatters.js';
import { formatDate } from '../../utils/dateUtils.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { cn } from '../../lib/utils.js';

// Custom Map Recenter Component
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

// Custom Zoom Control Component inside the Map Container
function ZoomControl() {
  const map = useMap();
  return (
    <div className="flex flex-col rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden pointer-events-auto">
      <button 
        onClick={() => map.zoomIn()}
        className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-800 transition-colors"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button 
        onClick={() => map.zoomOut()}
        className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}

// Custom Pulsing Conflict Icon using Leaflet DivIcon
const createConflictIcon = (score) => {
  return new L.DivIcon({
    html: `<div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute w-8 h-8 bg-red-500 rounded-full opacity-35 animate-ping"></div>
      <div class="relative w-5.5 h-5.5 bg-red-600 rounded-full border-2 border-white dark:border-slate-900 shadow-lg flex items-center justify-center">
        <span class="text-[10px] text-white font-bold font-sans">!</span>
      </div>
    </div>`,
    className: 'custom-conflict-marker-wrapper', 
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function GISMapPage() {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Core Data State
  const [projects, setProjects] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Item details (can be project or conflict)
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedConflict, setSelectedConflict] = useState(null);

  // Map Recenter Center State
  const [mapCenter, setMapCenter] = useState(MAP_CONFIG.CENTER);
  const [mapZoom, setMapZoom] = useState(MAP_CONFIG.ZOOM);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState(['IN_PROGRESS', 'SCHEDULED', 'UNDER_REVIEW', 'APPROVED']);
  const [deptFilters, setDeptFilters] = useState([]); // Empty means all

  // UI state toggles
  const [showLayers, setShowLayers] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  // Bhopal Center Fallback coordinates extractor
  const getCoords = (p) => {
    if (p.coordinates && p.coordinates.length === 2 && !isNaN(p.coordinates[0])) {
      return p.coordinates;
    }
    if (p.location && typeof p.location.lat === 'number' && typeof p.location.lng === 'number') {
      return [p.location.lat, p.location.lng];
    }
    return null;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch projects & conflicts parallelly
      const [projRes, confRes] = await Promise.all([
        axiosInstance.get(ENDPOINTS.PROJECTS, { params: { limit: 100 } }),
        axiosInstance.get(ENDPOINTS.CONFLICTS)
      ]);

      const projectsData = projRes.data.data || [];
      const conflictsData = confRes.data.data || [];

      setProjects(projectsData);
      setConflicts(conflictsData);

      // Handle query string parameters for initial selection
      const queryProjectId = searchParams.get('project');
      const queryConflictId = searchParams.get('conflict');

      if (queryProjectId) {
        const found = projectsData.find(p => p.id === queryProjectId);
        if (found) {
          setSelectedProject(found);
          const coords = getCoords(found);
          if (coords) setMapCenter(coords);
        }
      } else if (queryConflictId) {
        const found = conflictsData.find(c => c.id === queryConflictId);
        if (found) {
          setSelectedConflict(found);
          // Find first involved project for centering
          const firstProjId = found.involvedProjectIds[0];
          const foundProj = projectsData.find(p => p.id === firstProjId);
          if (foundProj) {
            const coords = getCoords(foundProj);
            if (coords) setMapCenter(coords);
          }
        }
      }

    } catch (err) {
      setError('Failed to load GIS Map layers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter projects based on toolbar/layer controls
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const coords = getCoords(p);
      if (!coords) return false;

      const matchesSearch = searchQuery.trim()
        ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.location?.address && p.location.address.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      const matchesStatus = statusFilters.includes(p.status);
      const matchesDept = deptFilters.length > 0 ? deptFilters.includes(p.department) : true;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [projects, searchQuery, statusFilters, deptFilters]);

  // Active conflicts (only display conflicts that involve at least one filtered project)
  const activeConflicts = useMemo(() => {
    return conflicts.filter(c => {
      if (c.status === 'RESOLVED') return false;
      return c.involvedProjectIds.some(pid => filteredProjects.some(p => p.id === pid));
    });
  }, [conflicts, filteredProjects]);

  // Click handler for project marker
  const handleProjectClick = (p) => {
    setSelectedConflict(null);
    setSelectedProject(p);
    const coords = getCoords(p);
    if (coords) {
      setMapCenter(coords);
      setMapZoom(14);
    }
    setSearchParams({ project: p.id });
  };

  // Click handler for conflict marker
  const handleConflictClick = (c) => {
    setSelectedProject(null);
    setSelectedConflict(c);
    
    // Recenter on first project coordinates
    const pId = c.involvedProjectIds[0];
    const foundProj = projects.find(p => p.id === pId);
    if (foundProj) {
      const coords = getCoords(foundProj);
      if (coords) {
        setMapCenter(coords);
        setMapZoom(14);
      }
    }
    setSearchParams({ conflict: c.id });
  };

  // Handle drawer close
  const handleCloseDrawer = () => {
    setSelectedProject(null);
    setSelectedConflict(null);
    setSearchParams({});
  };

  // Department Filters click handler
  const handleDeptToggle = (dept) => {
    setDeptFilters(prev => {
      if (prev.includes(dept)) {
        return prev.filter(d => d !== dept);
      } else {
        return [...prev, dept];
      }
    });
  };

  // Status Filters click handler
  const handleStatusToggle = (status) => {
    setStatusFilters(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="text-sm text-slate-500 mt-4">Hydrating coordinate layers & loading GIS map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
        <button onClick={fetchData} className="ml-auto underline font-semibold">Retry</button>
      </div>
    );
  }

  const isDrawerOpen = selectedProject || selectedConflict;

  return (
    <div className="relative w-full h-[calc(100vh-8.5rem)] flex overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm">
      
      {/* ─── Leaflet Map Container ─── */}
      <div className="absolute inset-0 w-full h-full z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          zoomControl={false}
          className={cn("w-full h-full", isDark && "dark:invert dark:hue-rotate-180 dark:brightness-[0.9] dark:contrast-[0.9]")}
        >
          <TileLayer
            attribution={MAP_CONFIG.TILE_ATTRIBUTION}
            url={MAP_CONFIG.TILE_URL}
          />
          <MapRecenter center={mapCenter} zoom={mapZoom} />

          {/* 1. Draw Conflict Overlays (Dashed Red Warning Rings) */}
          {activeConflicts.map(c => {
            return c.involvedProjectIds.map(pId => {
              const p = projects.find(proj => proj.id === pId);
              if (!p) return null;
              const coords = getCoords(p);
              if (!coords) return null;

              return (
                <CircleMarker
                  key={`conflict-zone-${c.id}-${pId}`}
                  center={coords}
                  radius={35}
                  fillColor="#EF4444"
                  color="#EF4444"
                  weight={1.5}
                  fillOpacity={0.06}
                  dashArray="5 5"
                />
              );
            });
          })}

          {/* 2. Draw Project Coordinates CircleMarkers */}
          {filteredProjects.map(p => {
            const coords = getCoords(p);
            const deptColor = DEPARTMENT_COLORS[p.department]?.hex || '#3B82F6';
            const isSelected = selectedProject?.id === p.id;

            return (
              <CircleMarker
                key={p.id}
                center={coords}
                radius={isSelected ? 16 : 10}
                fillColor={deptColor}
                color={isSelected ? '#ffffff' : '#ffffff'}
                weight={isSelected ? 4 : 2}
                fillOpacity={0.9}
                eventHandlers={{
                  click: () => handleProjectClick(p)
                }}
                className="cursor-pointer transition-all duration-150"
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={0.95}>
                  <div className="font-semibold text-xs leading-none">{p.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-none">{p.department}</div>
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* 3. Draw Pulsing Conflict Indicators (Markers) */}
          {activeConflicts.map(c => {
            // Find coordinate of the first project involved
            const pId = c.involvedProjectIds[0];
            const p = projects.find(proj => proj.id === pId);
            if (!p) return null;
            const coords = getCoords(p);
            if (!coords) return null;

            return (
              <Marker
                key={`conflict-marker-${c.id}`}
                position={coords}
                icon={createConflictIcon(c.conflictScore)}
                eventHandlers={{
                  click: () => handleConflictClick(c)
                }}
              >
                <Tooltip direction="bottom" offset={[0, 8]}>
                  <div className="font-bold text-red-650 text-xs">Overlap Conflict Detected</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{c.roadName} ({c.conflictScore}/100 Risk)</div>
                </Tooltip>
              </Marker>
            );
          })}

          {/* Map Controls Floating Overlay (Inside Map z-index space) */}
          <div className={cn(
            "absolute top-4 z-[1000] flex flex-col gap-2 transition-all duration-300 pointer-events-none",
            isDrawerOpen ? "right-[376px]" : "right-4"
          )}>
            <ZoomControl />
            <button 
              onClick={() => setShowLegend(!showLegend)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors pointer-events-auto"
              title="Toggle Legend"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Legend Popup Card */}
            {showLegend && (
              <div className="absolute right-12 top-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-4 w-52 pointer-events-auto border-subtle">
                <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-3">Departments</h4>
                <div className="flex flex-col gap-2">
                  {Object.entries(DEPARTMENT_COLORS).map(([name, conf]) => (
                    <div key={name} className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded bg-primary" style={{ backgroundColor: conf.hex }}></div>
                      <span className="text-xs text-slate-700 dark:text-slate-300 truncate font-medium">{name}</span>
                    </div>
                  ))}
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-red-500 bg-red-100 dark:bg-red-950/20 flex items-center justify-center text-[8px] text-red-600 font-bold">!</div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Active Conflict</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </MapContainer>
      </div>

      {/* ─── Floating UI: Search/Filter Box (Top Left) ─── */}
      <div className="absolute top-4 left-4 z-[1000] w-80 shadow-md border border-slate-200 dark:border-slate-850 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-1.5 flex items-center gap-1.5">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search location or project ID..."
          className="flex-1 bg-transparent border-none text-xs focus:outline-none focus:ring-0 p-0 text-slate-800 dark:text-slate-100 placeholder-slate-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
        <button 
          onClick={() => setShowLayers(!showLayers)}
          className={cn(
            "p-1.5 rounded transition-colors", 
            showLayers 
              ? "bg-primary text-white" 
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850"
          )}
          title="Toggle Layers Sidebar"
        >
          <Filter className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── Floating UI: Left Side Filters Panel ─── */}
      {showLayers && (
        <div className="absolute top-18 left-4 z-[1000] w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Active Layers
            </h3>
            <button onClick={() => setShowLayers(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="p-4 flex flex-col gap-4">
            {/* Status Checkboxes */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5 block">Status</label>
              <div className="flex flex-col gap-2">
                {[
                  { key: 'IN_PROGRESS', label: 'Active Construction' },
                  { key: 'UNDER_REVIEW', label: 'Under Review' },
                  { key: 'SCHEDULED', label: 'Scheduled' },
                  { key: 'APPROVED', label: 'Approved' }
                ].map(s => {
                  const checked = statusFilters.includes(s.key);
                  return (
                    <label key={s.key} className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <input 
                        type="checkbox" 
                        checked={checked}
                        onChange={() => handleStatusToggle(s.key)}
                        className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 dark:bg-slate-950 w-3.5 h-3.5" 
                      />
                      <span>{s.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

            {/* Department Filter Pills */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5 block">Department</label>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(DEPARTMENT_COLORS).map(dept => {
                  const isActive = deptFilters.includes(dept);
                  return (
                    <span 
                      key={dept} 
                      onClick={() => handleDeptToggle(dept)}
                      className={cn(
                        "px-2 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-all duration-150",
                        isActive
                          ? "bg-primary/10 border-primary/30 text-primary font-bold dark:bg-primary/20 dark:text-primary-400"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      )}
                    >
                      {dept}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
            {(deptFilters.length > 0 || statusFilters.length < 4 || searchQuery) && (
              <button 
                onClick={() => {
                  setDeptFilters([]);
                  setStatusFilters(['IN_PROGRESS', 'SCHEDULED', 'UNDER_REVIEW', 'APPROVED']);
                  setSearchQuery('');
                }}
                className="flex-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold py-1.5 text-center transition-colors border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-850"
              >
                Reset
              </button>
            )}
            <button className="flex-[2] flex items-center justify-center gap-1.5 bg-white dark:bg-slate-950 border border-primary text-primary dark:text-primary-400 font-bold text-xs py-1.5 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors shadow-sm">
              <Layers className="w-3.5 h-3.5" />
              Draw Boundary
            </button>
          </div>
        </div>
      )}

      {/* ─── Slide-in Drawer (Right Side) ─── */}
      <div className={cn(
        "absolute top-0 right-0 h-full w-[360px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[1010] flex flex-col transition-transform duration-300 ease-in-out",
        isDrawerOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/30">
          {selectedProject && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DEPARTMENT_COLORS[selectedProject.department]?.hex }}></span>
                <span className="text-xs font-bold text-primary dark:text-primary-400 uppercase tracking-widest">{selectedProject.department}</span>
              </div>
              <h2 className="font-bold text-base text-slate-800 dark:text-slate-100 leading-tight truncate w-[270px]" title={selectedProject.name}>
                {selectedProject.name}
              </h2>
            </div>
          )}
          {selectedConflict && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Active Conflict Zone</span>
              </div>
              <h2 className="font-bold text-base text-slate-800 dark:text-slate-100 leading-tight">
                {selectedConflict.roadName}
              </h2>
            </div>
          )}
          <button 
            onClick={handleCloseDrawer}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/30 dark:bg-slate-900/10">
          
          {/* A. PROJECT CONTENT LAYOUT */}
          {selectedProject && (
            <>
              {/* Status Row */}
              <div className="flex items-center justify-between">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold border",
                  selectedProject.status === 'IN_PROGRESS' && "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30",
                  selectedProject.status === 'UNDER_REVIEW' && "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30",
                  selectedProject.status === 'SCHEDULED' && "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30",
                  selectedProject.status === 'APPROVED' && "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30",
                  selectedProject.status === 'COMPLETED' && "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-900"
                )}>
                  {STATUS_CONFIG[selectedProject.status]?.label || selectedProject.status}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>Priority</span>
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    selectedProject.priority === 'CRITICAL' && "bg-red-500",
                    selectedProject.priority === 'HIGH' && "bg-orange-500",
                    selectedProject.priority === 'MEDIUM' && "bg-amber-500",
                    selectedProject.priority === 'LOW' && "bg-green-500"
                  )}></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedProject.priority}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Overview</span>
                <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Budget</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrencyShort(selectedProject.budget)}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Timeline</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{formatDate(selectedProject.startDate)} - {formatDate(selectedProject.endDate)}</span>
                </div>
              </div>

              {/* Lead Officer Card */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {selectedProject.assignedOfficer ? selectedProject.assignedOfficer.charAt(0) : 'U'}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Assigned Officer</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedProject.assignedOfficer || 'Officer Office'}</span>
                </div>
                <button className="ml-auto p-1.5 text-primary dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
              </div>

              {/* Conflict Warnings Section */}
              {selectedProject.conflictIds?.length > 0 ? (
                <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-red-100 dark:border-red-900/20 pb-2">
                    <span className="text-xs font-bold text-red-650 dark:text-red-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Conflict Alert
                    </span>
                    <span className="text-xs font-bold text-red-650 bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                      Score: High
                    </span>
                  </div>
                  
                  {selectedProject.conflictIds.map(cId => {
                    const conf = conflicts.find(c => c.id === cId);
                    if (!conf) return null;
                    return (
                      <div key={cId} className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                          {conf.locationDescription}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                          Overlap with: {conf.departmentsInvolved.filter(d => d !== selectedProject.department).join(', ')}
                        </p>
                        <button 
                          onClick={() => handleConflictClick(conf)}
                          className="text-red-600 dark:text-red-400 text-xs font-semibold hover:underline flex items-center gap-1 pt-1"
                        >
                          Evaluate Conflict Details
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-green-50/50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/30 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="text-xs font-bold text-green-800 dark:text-green-400">Clear Coordinate Corridor</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">No spatial conflicts detected for this project.</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* B. CONFLICT CONTENT LAYOUT */}
          {selectedConflict && (
            <>
              {/* Conflict Status Alert Header */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-xs font-bold uppercase tracking-wider">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {selectedConflict.status}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Index</span>
                  <span className="text-xs font-extrabold text-red-650 bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded">
                    {selectedConflict.conflictScore}/100
                  </span>
                </div>
              </div>

              {/* Overlap Coordinates Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Spatial Intersection</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {selectedConflict.locationDescription}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detected: {new Date(selectedConflict.detectedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Involved Departments Section */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Involved Planners</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedConflict.departmentsInvolved.map(dept => (
                    <span 
                      key={dept} 
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conflict Suggested Actions Checklist */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Suggested Resolutions</span>
                <div className="flex flex-col gap-2">
                  {selectedConflict.suggestedActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="w-5 h-5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-650 flex items-center justify-center shrink-0 mt-0.5 text-xs font-extrabold">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Involved Project Links */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Conflicting Initiatives</span>
                <div className="flex flex-col gap-2">
                  {selectedConflict.involvedProjectIds.map(pId => {
                    const p = projects.find(proj => proj.id === pId);
                    if (!p) return null;
                    return (
                      <div 
                        key={pId} 
                        onClick={() => handleProjectClick(p)}
                        className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary cursor-pointer shadow-sm flex items-center justify-between group transition-all"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-primary dark:text-primary-400 block">{p.id}</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate block w-[230px]">{p.name}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col gap-2">
          {selectedProject && (
            <button 
              onClick={() => navigate(`/projects/${selectedProject.id}`)}
              className="w-full bg-primary text-white font-bold text-xs py-2.5 rounded-lg hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              View Full Details
            </button>
          )}
          {selectedConflict && (
            <button 
              onClick={() => navigate(`/conflicts?id=${selectedConflict.id}`)}
              className="w-full bg-primary text-white font-bold text-xs py-2.5 rounded-lg hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              Evaluate Resolution Workflow
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

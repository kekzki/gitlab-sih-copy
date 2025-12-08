import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Activity, 
  Leaf, 
  Clock, 
  Plus, 
  Minus, 
  RotateCcw,
  Navigation,
  Loader2
} from 'lucide-react';

// --- Mappings & Helpers ---

// Since the backend doesn't store UI coordinates, we map Region Names to Map positions here.
const REGION_MAP = {
  'Pacific': { top: '40%', left: '80%' },
  'Atlantic': { top: '30%', left: '30%' },
  'Indian': { top: '65%', left: '60%' },
  'Bay of Bengal': { top: '60%', left: '70%' },
  'Arabian Sea': { top: '60%', left: '55%' },
  // Fallbacks for unknown regions distributed randomly
  'default': { top: '50%', left: '50%' }
};

const getStatus = (temp, salinity) => {
  const t = parseFloat(temp);
  const s = parseFloat(salinity);
  if (t > 30 || s < 30) return { label: 'Critical', color: 'rose', score: 45 };
  if (t > 28 || s < 33) return { label: 'Warning', color: 'amber', score: 65 };
  return { label: 'Optimal', color: 'emerald', score: 92 };
};

const EcosystemTab = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState([]);
  const [activeLayer, setActiveLayer] = useState('health');
  
  // HUD State (Default placeholder)
  const [probeData, setProbeData] = useState({
    location: "Select a Sensor",
    coords: "--",
    temp: "--",
    salinity: "--",
    health: 0,
    status: "Waiting..."
  });

  // --- Data Fetching ---
  useEffect(() => {
    const initMap = async () => {
      try {
        // 1. Get all active regions
        const regionsRes = await fetch('/api/oceanographic/regions');
        const regionList = await regionsRes.json();
        
        if (!regionList) {
            setLoading(false);
            return;
        }

        // 2. Fetch latest data for each region
        const markerPromises = regionList.map(async (regionName) => {
          // Get recent data to find the latest reading
          const res = await fetch(`/api/oceanographic/parameters?region=${regionName}&start_date=2023-01-01`);
          const data = await res.json();
          
          if (data && data.length > 0) {
            // Take the last item as "Live"
            const latest = data[data.length - 1];
            const coords = REGION_MAP[regionName] || REGION_MAP.default;
            
            return {
              id: latest.ID,
              region: regionName,
              // Use data from backend or fallbacks
              temp: latest.Data.temperature || "0",
              salinity: latest.Data.salinity || "0",
              lat: latest.Data.latitude || coords.top, // Ideally backend has this
              long: latest.Data.longitude || coords.left,
              ...coords // UI Positioning
            };
          }
          return null;
        });

        const resolvedMarkers = (await Promise.all(markerPromises)).filter(m => m !== null);
        setMarkers(resolvedMarkers);
        
        // Auto-select first marker for probe
        if (resolvedMarkers.length > 0) {
            handleMarkerHover(resolvedMarkers[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to load map data", err);
        setLoading(false);
      }
    };

    initMap();
  }, []);

  const handleMarkerHover = (marker) => {
    const status = getStatus(marker.temp, marker.salinity);
    setProbeData({
      location: marker.region,
      coords: `${marker.lat}, ${marker.long}`, // Using raw vals if backend provided, else CSS %
      temp: `${parseFloat(marker.temp).toFixed(1)}°C`,
      salinity: `${parseFloat(marker.salinity).toFixed(1)} PSU`,
      health: status.score,
      status: status.label,
      color: status.color
    });
  };

  return (
    <div className="relative w-full h-[700px] bg-[#f0f9ff] rounded-3xl border border-slate-200 overflow-hidden group">
      
      {/* ----------------------------------------------------------------------- */}
      {/* 1. THE MAP CANVAS (Background & Markers) */}
      {/* ----------------------------------------------------------------------- */}
      
      {/* Map Background Pattern */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', 
        backgroundSize: '100px 100px',
        opacity: 0.2 
      }}></div>

      {/* Placeholder Coastline */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
         <MapIcon size={400} className="text-slate-400" />
      </div>

      {/* -- INTERACTIVE MARKERS (Dynamic) -- */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={40} />
        </div>
      )}

      {!loading && markers.map((m, idx) => {
          const status = getStatus(m.temp, m.salinity);
          return (
            <MapMarker 
                key={idx}
                top={m.top} 
                left={m.left} 
                color={status.color} 
                pulse={status.label !== 'Optimal'}
                onHover={() => handleMarkerHover(m)}
            />
          );
      })}

      {/* ----------------------------------------------------------------------- */}
      {/* 2. THE "LAYER COMMAND" CARD (Top-Left) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="absolute top-6 left-6 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-0 overflow-hidden z-20">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <MapIcon className="text-emerald-600" size={20} />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Map Layers</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Select Overlay</p>
            </div>
          </div>
        </div>
        
        <div className="p-2">
          <div className="text-[10px] font-bold text-slate-400 px-3 py-2 uppercase">Physical Oceanography</div>
          <LayerToggle label="Temperature (SST)" icon={<Thermometer size={16}/>} active={activeLayer === 'temp'} onClick={() => setActiveLayer('temp')} />
          <LayerToggle label="Salinity (PSU)" icon={<Droplets size={16}/>} active={activeLayer === 'salinity'} onClick={() => setActiveLayer('salinity')} />
          <LayerToggle label="Pressure" icon={<Gauge size={16}/>} active={activeLayer === 'pressure'} onClick={() => setActiveLayer('pressure')} />
          
          <div className="text-[10px] font-bold text-slate-400 px-3 py-2 mt-2 uppercase">Ecosystem Health</div>
          <LayerToggle label="Health Index Score" icon={<Activity size={16}/>} active={activeLayer === 'health'} onClick={() => setActiveLayer('health')} />
          <LayerToggle label="Chlorophyll" icon={<Leaf size={16}/>} active={activeLayer === 'chloro'} onClick={() => setActiveLayer('chloro')} />
        </div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 3. THE "LIVE DATA PROBE" (Top-Right HUD) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="absolute top-6 right-6 w-64 bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-slate-100 p-5 transition-all duration-300 z-20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Live Probe</div>
            <div className="text-sm font-bold text-slate-800 truncate pr-2">{probeData.location}</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">{probeData.coords}</div>
          </div>
          <div className={`w-2 h-2 rounded-full animate-pulse ${probeData.color === 'rose' ? 'bg-rose-500' : probeData.color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Temp</div>
            <div className="text-lg font-bold text-slate-700">{probeData.temp}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Salinity</div>
            <div className="text-lg font-bold text-slate-700">{probeData.salinity}</div>
          </div>
          <div className="col-span-2 mt-1 bg-slate-50 rounded-lg p-2 flex justify-between items-center border border-slate-100">
            <span className="text-xs font-bold text-slate-500">Health Index</span>
            <span className={`text-sm font-bold ${probeData.health < 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {probeData.status} ({probeData.health})
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 4. LEGEND & TIME CONTROL (Bottom-Center) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <div className="flex items-center bg-white rounded-full shadow-2xl border border-slate-200 px-6 py-3 gap-6">
          
          <div className="flex flex-col gap-1 w-48">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Critical</span>
              <span>Optimal</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500"></div>
          </div>

          <div className="w-px h-8 bg-slate-200"></div>

          <div className="flex items-center gap-3">
            <button 
                onClick={() => window.location.reload()}
                className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-500 hover:text-white transition-colors"
            >
              <RotateCcw size={14} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Clock size={12} className="text-emerald-500" /> Live Feed
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Synced</div>
            </div>
          </div>

        </div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 5. INTERACTION CONTROLS (Bottom-Right) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="absolute bottom-8 right-6 flex flex-col gap-3 z-20">
        <MapControlBtn icon={<Plus size={20} />} />
        <MapControlBtn icon={<Minus size={20} />} />
        <MapControlBtn icon={<Navigation size={18} />} />
      </div>

    </div>
  );
};

// --- Sub-Components ---

const LayerToggle = ({ label, icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 transition-all duration-200
      ${active ? 'bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}
  >
    <div className="flex items-center gap-3">
      <div className={`${active ? 'text-emerald-600' : 'text-slate-400'}`}>{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className={`w-4 h-4 rounded-full border-[3px] ${active ? 'border-emerald-500 bg-white' : 'border-slate-300 bg-transparent'}`}></div>
  </button>
);

const MapMarker = ({ top, left, color, pulse, onHover }) => {
  const colors = {
    emerald: 'bg-emerald-500 shadow-emerald-500/40',
    rose: 'bg-rose-500 shadow-rose-500/40',
    amber: 'bg-amber-500 shadow-amber-500/40'
  };

  return (
    <div 
      className="absolute cursor-pointer group z-10" 
      style={{ top, left }}
      onMouseEnter={onHover}
    >
      <div className="relative flex items-center justify-center">
        {pulse && (
          <div className={`absolute w-full h-full rounded-full ${colors[color].split(' ')[0]} opacity-75 animate-ping`}></div>
        )}
        <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg z-10 transition-transform group-hover:scale-125 ${colors[color]}`}></div>
      </div>
    </div>
  );
};

const MapControlBtn = ({ icon }) => (
  <button className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-lg border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
    {icon}
  </button>
);

export default EcosystemTab;

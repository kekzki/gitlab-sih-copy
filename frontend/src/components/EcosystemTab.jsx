import React, { useState } from 'react';
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
  Navigation
} from 'lucide-react';

const EcosystemTab = () => {
  // State for the "Live Probe" (Simulating hover data)
  const [probeData, setProbeData] = useState({
    location: "Bay of Bengal (Zone A)",
    coords: "12.45°N, 81.2°E",
    temp: "28.4°C",
    salinity: "34.1 PSU",
    health: 72,
    status: "Good"
  });

  // State for Active Layer
  const [activeLayer, setActiveLayer] = useState('health');

  // Mock function to update probe data on marker hover
  const handleMarkerHover = (data) => {
    setProbeData(data);
  };

  return (
    <div className="relative w-full h-[700px] bg-[#f0f9ff] rounded-3xl border border-slate-200 overflow-hidden group">
      
      {/* ----------------------------------------------------------------------- */}
      {/* 1. THE MAP CANVAS (Background & Markers) */}
      {/* ----------------------------------------------------------------------- */}
      
      {/* Map Background Pattern (Subtle Lat/Long Lines) */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', 
        backgroundSize: '100px 100px',
        opacity: 0.2 
      }}></div>

      {/* Styled India Coastline Placeholder (In real app, use React-Leaflet GeoJSON) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
         <MapIcon size={400} className="text-slate-400" />
      </div>

      {/* -- INTERACTIVE MARKERS -- */}
      
      {/* Marker 1: Normal (Green) - Kochi */}
      <MapMarker 
        top="70%" left="30%" color="emerald" 
        pulse={false}
        onHover={() => handleMarkerHover({
          location: "Kochi Coast (St-04)", coords: "9.93°N, 76.26°E",
          temp: "27.1°C", salinity: "33.5 PSU", health: 85, status: "Optimal"
        })}
      />

      {/* Marker 2: Critical (Red) - Chennai */}
      <MapMarker 
        top="65%" left="60%" color="rose" 
        pulse={true}
        onHover={() => handleMarkerHover({
          location: "Chennai Harbor (St-09)", coords: "13.08°N, 80.27°E",
          temp: "31.2°C", salinity: "28.4 PSU", health: 45, status: "Critical"
        })}
      />

      {/* Marker 3: Warning (Amber) - Vizag */}
      <MapMarker 
        top="50%" left="65%" color="amber" 
        pulse={true}
        onHover={() => handleMarkerHover({
          location: "Vizag Deep Sea (St-12)", coords: "17.68°N, 83.21°E",
          temp: "29.8°C", salinity: "35.0 PSU", health: 62, status: "Warning"
        })}
      />

      {/* ----------------------------------------------------------------------- */}
      {/* 2. THE "LAYER COMMAND" CARD (Top-Left) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="absolute top-6 left-6 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-0 overflow-hidden">
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
      <div className="absolute top-6 right-6 w-64 bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-slate-100 p-5 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Live Probe</div>
            <div className="text-sm font-bold text-slate-800">{probeData.location}</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{probeData.coords}</div>
          </div>
          <div className={`w-2 h-2 rounded-full animate-pulse ${probeData.status === 'Critical' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        {/* The Pill Container */}
        <div className="flex items-center bg-white rounded-full shadow-2xl border border-slate-200 px-6 py-3 gap-6">
          
          {/* Legend Section */}
          <div className="flex flex-col gap-1 w-48">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Critical</span>
              <span>Optimal</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500"></div>
          </div>

          <div className="w-px h-8 bg-slate-200"></div>

          {/* Time Scrubber Section */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-500 hover:text-white transition-colors">
              <RotateCcw size={14} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Clock size={12} className="text-emerald-500" /> Live Feed
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Updating every 10s</div>
            </div>
          </div>

        </div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 5. INTERACTION CONTROLS (Bottom-Right) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="absolute bottom-8 right-6 flex flex-col gap-3">
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
      className="absolute cursor-pointer group" 
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
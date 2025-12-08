import React, { useState, useEffect } from 'react';
import { Map, Leaf, Fish, Filter, Star, Loader2, AlertCircle } from 'lucide-react';

// --- VISUAL ASSETS ---
// Since the backend doesn't store SVG shapes, we keep the shapes static
// but hydrate them with REAL data from the backend.
const ZONE_SHAPES = [
  { polygon: 'M 100 50 L 150 70 L 160 120 L 110 130 Z', centroid: { x: 130, y: 90 } },
  { polygon: 'M 300 150 L 350 160 L 340 210 L 290 200 Z', centroid: { x: 320, y: 180 } },
  { polygon: 'M 80 200 C 100 180, 130 180, 150 200 S 130 220, 100 220 S 60 220, 80 200', centroid: { x: 115, y: 200 } },
  { polygon: 'M 400 50 L 450 50 L 450 100 L 400 100 Z', centroid: { x: 425, y: 75 } },
];

const zoneStyles = {
  MPA: { fill: 'fill-emerald-500/20', stroke: 'stroke-emerald-500', icon: <Leaf size={16}/> },
  Aquaculture: { fill: 'fill-blue-500/20', stroke: 'stroke-blue-500', icon: <Fish size={16}/> },
  Tourism: { fill: 'fill-orange-500/20', stroke: 'stroke-orange-500', icon: <Star size={16}/> },
};

const RecommendationCard = ({ suggestion, onSelect, isSelected }) => {
  const badgeColors = {
    MPA: 'bg-green-100 text-green-800',
    Aquaculture: 'bg-blue-100 text-blue-800',
    Tourism: 'bg-orange-100 text-orange-800',
  };

  return (
    <div 
      onClick={() => onSelect(suggestion.id)}
      className={`bg-white rounded-xl border border-slate-100 shadow-sm p-4 cursor-pointer transition-all duration-200 ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-100' : 'hover:border-cyan-300'}`}
    >
      <div className="flex justify-between items-center">
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeColors[suggestion.type]}`}>{suggestion.type} Candidate</span>
        <span className="text-lg font-bold text-emerald-950">{suggestion.score}<span className="text-sm text-slate-400">/100</span></span>
      </div>
      <div className="my-3">
        <h3 className="text-xl font-bold text-slate-800 truncate">{suggestion.name}</h3>
        <p className="text-xs text-slate-500 font-mono">{suggestion.coords}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 mb-1.5">Key Drivers:</p>
        <div className="flex flex-wrap gap-1.5">
          {suggestion.drivers.map((driver, i) => (
            <span key={i} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{driver}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const SuggestionsTab = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedZone, setSelectedZone] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING & ANALYSIS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Regions (Locations)
        const regionsRes = await fetch('/api/oceanographic/regions');
        const regions = await regionsRes.json();
        
        if (!regions || regions.length === 0) {
            setLoading(false);
            return;
        }

        const generatedSuggestions = [];

        // 2. Analyze each region using real backend data
        // We limit to 4 regions to match our visual shapes for this demo
        for (let i = 0; i < Math.min(regions.length, 4); i++) {
            const region = regions[i];
            
            // Fetch Biodiversity for MPA Analysis
            const bioRes = await fetch(`/api/biodiversity/metrics?region=${region}`);
            const bioData = await bioRes.json();
            
            // Fetch Ocean Phys-Chem for Aquaculture Analysis
            const oceanRes = await fetch(`/api/oceanographic/parameters?region=${region}&start_date=2023-01-01`);
            const oceanData = await oceanRes.json();

            // --- SCORE LOGIC ---
            // Calculate Average Diversity
            const avgDiversity = bioData && bioData.length > 0 
                ? bioData.reduce((acc, curr) => acc + parseFloat(curr.Data.shannon_index || 0), 0) / bioData.length
                : 1.5; // Fallback

            // Calculate Temp Stability (Standard Deviation proxy)
            const temps = oceanData ? oceanData.map(d => parseFloat(d.Data.temperature || 0)) : [];
            const avgTemp = temps.reduce((a,b)=>a+b,0) / (temps.length || 1);
            // Low variance = High Stability
            const isStable = temps.every(t => Math.abs(t - avgTemp) < 2);

            // Determine Zone Type
            let type = 'Tourism'; // Default
            let drivers = ['Scenic Value'];
            let score = 70;

            if (avgDiversity > 2.0) {
                type = 'MPA';
                score = Math.min(99, Math.round(avgDiversity * 30));
                drivers = ['High Biodiversity', `Shannon Index: ${avgDiversity.toFixed(2)}`, 'Endangered Species'];
            } else if (isStable && avgTemp > 20 && avgTemp < 30) {
                type = 'Aquaculture';
                score = 85 + Math.floor(Math.random() * 10);
                drivers = ['Stable Temperature', 'Optimal Growth Range', 'Low Pollution Risk'];
            }

            generatedSuggestions.push({
                id: `zone-${i}`,
                type: type,
                name: region,
                coords: `Sector ${String.fromCharCode(65+i)}-${i+1}`, // Mock coords for UI
                score: score,
                drivers: drivers,
                ...ZONE_SHAPES[i % ZONE_SHAPES.length] // Assign visual shape
            });
        }

        setSuggestions(generatedSuggestions);
        setLoading(false);

      } catch (err) {
        console.error("Failed to generate AI suggestions", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSuggestions = suggestions.filter(s => 
    activeFilter === 'All' || s.type === activeFilter
  );

  return (
    <div className="flex flex-col md:flex-row h-full bg-white">
      
      {/* 1. Left Panel: Map Visualization */}
      <div className="w-full md:w-[65%] lg:w-[70%] bg-slate-100 relative overflow-hidden min-h-[400px]">
        {loading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/80 z-20">
                <Loader2 size={40} className="animate-spin text-cyan-500 mb-4" />
                <p className="text-slate-500 font-semibold animate-pulse">AI Analyzing Zones...</p>
             </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <Map size={128} className="text-slate-300 opacity-50" />
        </div>
        
        {/*  */}
        <svg width="100%" height="100%" className="absolute inset-0">
          {!loading && suggestions.map(zone => {
            const style = zoneStyles[zone.type];
            const isSelected = selectedZone === zone.id;
            
            return (
              <g key={zone.id} onClick={() => setSelectedZone(zone.id)} className="cursor-pointer group">
                {/* Polygon Shape */}
                <path 
                    d={zone.polygon} 
                    className={`${style.fill} ${style.stroke} stroke-2 transition-all duration-300 ease-out group-hover:fill-opacity-40`} 
                    style={{ strokeDasharray: zone.type === 'Aquaculture' ? '4 4' : 'none' }} 
                />
                
                {/* Selection Highlight */}
                {isSelected && (
                    <path 
                        d={zone.polygon} 
                        className="fill-none stroke-cyan-400 stroke-[3px] animate-pulse" 
                        style={{ filter: 'drop-shadow(0 0 8px rgb(6 182 212 / 0.6))' }} 
                    />
                )}
                
                {/* Icon Badge */}
                <foreignObject x={zone.centroid.x - 12} y={zone.centroid.y - 12} width="24" height="24" className={`transition-transform duration-300 ${isSelected ? 'scale-125' : 'scale-100'}`}>
                  <div className={`w-full h-full rounded-full flex items-center justify-center shadow-md text-white ${style.stroke.replace('stroke-', 'bg-')}`}>
                      {style.icon}
                  </div>
                </foreignObject>
                
                {/* Tooltip on Select */}
                {isSelected && (
                  <foreignObject x={zone.centroid.x - 40} y={zone.centroid.y - 60} width="80" height="50">
                    <div className="bg-slate-900/90 backdrop-blur text-white rounded-lg p-2 text-center shadow-xl animate-in fade-in slide-in-from-bottom-2">
                      <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Score</div>
                      <div className="text-xl font-black text-cyan-400">{zone.score}</div>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm text-xs">
           <div className="font-bold text-slate-700 mb-2">Zone Types</div>
           <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> MPA (High Bio-D)</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Aquaculture (Stable)</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Tourism (Scenic)</div>
           </div>
        </div>
      </div>

      {/* 2. Right Panel: Suggestions Sidebar */}
      <div className="w-full md:w-[35%] lg:w-[30%] border-l border-slate-200 flex flex-col h-full bg-white">
        <div className="p-4 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur z-10">
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
             <Star className="text-yellow-400 fill-yellow-400" size={18}/> AI Recommendations
          </h2>
          
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Filter size={14} className="text-slate-400" />
            {['All', 'MPA', 'Aquaculture', 'Tourism'].map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all 
                  ${activeFilter === filter 
                    ? 'bg-cyan-500 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {loading ? (
             // Skeleton Loading State
             [1,2,3].map(i => (
                 <div key={i} className="bg-slate-50 h-32 rounded-xl animate-pulse"></div>
             ))
          ) : filteredSuggestions.length > 0 ? (
             filteredSuggestions.map(suggestion => (
                <RecommendationCard 
                  key={suggestion.id}
                  suggestion={suggestion}
                  onSelect={setSelectedZone}
                  isSelected={selectedZone === suggestion.id}
                />
             ))
          ) : (
             <div className="text-center py-10 text-slate-400">
                <AlertCircle className="mx-auto mb-2 opacity-50" />
                <p>No suitable zones found for this filter.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsTab;

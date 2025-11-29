import React, { useState } from 'react';
import { Map, Leaf, Fish, Filter, Star, Wind, Droplets } from 'lucide-react';

const mockSuggestions = [
  {
    id: 'gom',
    type: 'MPA',
    name: 'Gulf of Mannar',
    coords: '8.78° N, 78.12° E',
    score: 92,
    drivers: ['High Biodiversity', 'Endangered Species Habitat', 'Stable Salinity'],
    polygon: 'M 100 50 L 150 70 L 160 120 L 110 130 Z',
    centroid: { x: 130, y: 90 }
  },
  {
    id: 'ap',
    type: 'Aquaculture',
    name: 'Andhra Coast Zone-4',
    coords: '16.50° N, 82.25° E',
    score: 88,
    drivers: ['Optimal Nutrient Flow', 'Low Pollution', 'Good Tidal Flush'],
    polygon: 'M 300 150 L 350 160 L 340 210 L 290 200 Z',
    centroid: { x: 320, y: 180 }
  },
  {
    id: 'lak',
    type: 'Tourism',
    name: 'Lakshadweep Atoll B',
    coords: '10.56° N, 72.64° E',
    score: 76,
    drivers: ['High Water Clarity', 'Coral Health > 85%'],
    polygon: 'M 80 200 C 100 180, 130 180, 150 200 S 130 220, 100 220 S 60 220, 80 200',
    centroid: { x: 115, y: 200 }
  }
];

const zoneStyles = {
  MPA: { fill: 'fill-emerald-500/20', stroke: 'stroke-emerald-500', icon: <Leaf /> },
  Aquaculture: { fill: 'fill-blue-500/20', stroke: 'stroke-blue-500', icon: <Fish /> },
  Tourism: { fill: 'fill-orange-500/20', stroke: 'stroke-orange-500', icon: <Star /> },
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
        <h3 className="text-xl font-bold text-slate-800">{suggestion.name}</h3>
        <p className="text-xs text-slate-500 font-mono">{suggestion.coords}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 mb-1.5">Key Drivers:</p>
        <div className="flex flex-wrap gap-1.5">
          {suggestion.drivers.map(driver => (
            <span key={driver} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{driver}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const SuggestionsTab = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedZone, setSelectedZone] = useState(null);

  const filteredSuggestions = mockSuggestions.filter(s => 
    activeFilter === 'All' || s.type === activeFilter
  );

  return (
    <div className="flex h-full bg-white">
      {/* 1. Left Panel: Map Visualization */}
      <div className="w-[70%] bg-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Map size={128} className="text-slate-300" />
        </div>
        <svg width="100%" height="100%" className="absolute inset-0">
          {mockSuggestions.map(zone => {
            const style = zoneStyles[zone.type];
            const isSelected = selectedZone === zone.id;
            return (
              <g key={zone.id} onClick={() => setSelectedZone(zone.id)} className="cursor-pointer">
                <path d={zone.polygon} className={`${style.fill} ${style.stroke} stroke-2 transition-all`} style={{ strokeDasharray: zone.type === 'Aquaculture' ? '4 4' : 'none' }} />
                {isSelected && <path d={zone.polygon} className="fill-none stroke-cyan-400 stroke-[4px] animate-pulse" style={{ filter: 'drop-shadow(0 0 5px rgb(6 182 212 / 0.8))' }} />}
                <foreignObject x={zone.centroid.x - 12} y={zone.centroid.y - 12} width="24" height="24" className={`text-white transition-transform ${isSelected ? 'scale-125' : ''}`}>
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${style.stroke.replace('stroke-', 'bg-')}`}>{style.icon}</div>
                </foreignObject>
                {isSelected && (
                  <foreignObject x={zone.centroid.x - 40} y={zone.centroid.y - 50} width="80" height="40">
                    <div className="bg-slate-900 text-white rounded-lg p-2 text-center shadow-lg">
                      <div className="text-xs font-bold">Score</div>
                      <div className="text-lg font-black">{zone.score}</div>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 2. Right Panel: Suggestions Sidebar */}
      <div className="w-[30%] border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold text-emerald-950">AI Strategic Recommendations</h2>
          <div className="flex items-center gap-2 mt-3">
            <Filter size={14} className="text-slate-400" />
            {['All', 'MPA', 'Aquaculture'].map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeFilter === filter ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto">
          {filteredSuggestions.map(suggestion => (
            <RecommendationCard 
              key={suggestion.id}
              suggestion={suggestion}
              onSelect={setSelectedZone}
              isSelected={selectedZone === suggestion.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsTab;
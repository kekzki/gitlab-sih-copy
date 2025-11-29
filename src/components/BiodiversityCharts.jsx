import React from 'react';
import { Info } from 'lucide-react';

const BiodiversityCharts = () => {
  return (
    <div className="space-y-6">
      {/* Row 1: Main Trend Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-emerald-950">Biodiversity Health Indicators (Richness vs. Diversity)</h3>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg mt-2 sm:mt-0">
            <button className="px-3 py-1 text-sm font-semibold bg-white text-cyan-600 rounded-md shadow-sm">Yearly</button>
            <button className="px-3 py-1 text-sm font-semibold text-slate-500">Monthly</button>
          </div>
        </div>
        <div className="h-80 w-full relative">
          {/* Mock Recharts Composed Chart */}
          <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
            {/* Grid and Reference Line */}
            <line x1="0" y1="100" x2="500" y2="100" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
            <text x="5" y="97" fill="#f59e0b" fontSize="8">Healthy Ecosystem Threshold</text>
            {/* Bars for Species Richness */}
            {[...Array(6)].map((_, i) => (
              <rect key={i} x={20 + i * 80} y={[80, 70, 60, 40, 50, 65][i]} width="40" height={200 - [80, 70, 60, 40, 50, 65][i]} fill="#14b8a6" opacity="0.7" />
            ))}
            {/* Line for Shannon Index */}
            <path d="M 40 120 L 120 110 L 200 100 L 280 130 L 360 125 L 440 115" fill="none" stroke="#f97316" strokeWidth="2" />
            {[...Array(6)].map((_, i) => (
              <circle key={i} cx={40 + i * 80} cy={[120, 110, 100, 130, 125, 115][i]} r="3" fill="#f97316" stroke="white" strokeWidth="1" />
            ))}
          </svg>
        </div>
        <div className="text-xs text-center text-amber-700 font-semibold bg-amber-50 border border-amber-200 p-2 rounded-lg mt-4">
          ⚠️ 2023 saw high richness but low diversity, indicating dominance by a few invasive species.
        </div>
      </div>

      {/* Row 2: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Habitat Radar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-emerald-950">Habitat Health Score (0-1)</h3>
            <Info size={16} className="text-slate-400" />
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {/* Mock Recharts Radar Chart */}
            <svg viewBox="0 0 100 100" className="w-56 h-56">
              {/* Grid */}
              {[10, 20, 30, 40].map(r => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />)}
              {/* Axes */}
              <line x1="50" y1="50" x2="50" y2="5" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="93.3" y2="25" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="93.3" y2="75" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="6.7" y2="75" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="6.7" y2="25" stroke="#cbd5e1" strokeWidth="0.5" />
              {/* Data Polygons */}
              <polygon points="50,15 85,30 75,70 25,70 15,30" fill="#3b82f6" fillOpacity="0.4" />
              <polygon points="50,10 90,20 80,80 20,80 10,20" fill="none" stroke="#ef4444" strokeWidth="1.5" />
              {/* Labels */}
              <text x="45" y="2" fontSize="5" fill="#64748b">Coral</text>
              <text x="95" y="27" fontSize="5" fill="#64748b">Seagrass</text>
              <text x="95" y="78" fontSize="5" fill="#64748b">Mangroves</text>
              <text x="-5" y="78" fontSize="5" fill="#64748b">Rocky</text>
              <text x="-5" y="27" fontSize="5" fill="#64748b">Pelagic</text>
            </svg>
          </div>
        </div>

        {/* Right: Species Treemap */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-emerald-950 mb-4">Species Dominance & Evenness</h3>
          <div className="h-64 w-full bg-slate-50 rounded-lg p-1 grid grid-cols-5 grid-rows-4 gap-1">
            {/* Mock Recharts Treemap */}
            <div className="col-span-3 row-span-4 bg-sky-700 text-white p-2 flex flex-col justify-end rounded-l-md">
              <span className="font-bold">Sardine</span>
              <span className="text-sm">45%</span>
            </div>
            <div className="col-span-2 row-span-2 bg-sky-500 text-white p-2 flex flex-col justify-end rounded-tr-md">
              <span className="font-bold">Mackerel</span>
              <span className="text-sm">20%</span>
            </div>
            <div className="col-span-2 row-span-1 bg-sky-400 text-white p-1 flex flex-col justify-end">
              <span className="font-bold text-xs">Tuna</span>
              <span className="text-xs">15%</span>
            </div>
            <div className="col-span-2 row-span-1 bg-sky-300 text-sky-800 p-1 flex flex-col justify-end rounded-br-md">
              <span className="font-bold text-xs">Others</span>
              <span className="text-xs">20%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiodiversityCharts;
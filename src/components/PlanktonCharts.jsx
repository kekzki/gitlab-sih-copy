import React from 'react';

const PlanktonCharts = () => {
  return (
    <div className="space-y-6">
      {/* Top Row: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Top-Left: Phytoplankton vs. Nutrients */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-emerald-950 mb-4">Primary Productivity Drivers</h3>
          <div className="h-64 w-full relative">
            {/* Mock Recharts Scatter Chart */}
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
              {/* Trend Line */}
              <line x1="20" y1="130" x2="280" y2="20" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
              {/* Data Points */}
              <circle cx="50" cy="110" r="3" fill="#10b981" />
              <circle cx="80" cy="100" r="3" fill="#10b981" />
              <circle cx="120" cy="90" r="3" fill="#10b981" />
              <circle cx="150" cy="70" r="3" fill="#10b981" />
              <circle cx="180" cy="60" r="3" fill="#10b981" />
              <circle cx="220" cy="40" r="3" fill="#10b981" />
              <circle cx="250" cy="30" r="3" fill="#10b981" />
              {/* Low Biomass Dots */}
              <circle cx="60" cy="125" r="2" fill="#d1d5db" />
              <circle cx="90" cy="115" r="2" fill="#d1d5db" />
              <circle cx="130" cy="105" r="2" fill="#d1d5db" />
            </svg>
          </div>
          <div className="text-xs text-center text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 p-2 rounded-lg mt-4">
            📈 Strong correlation (R²=0.82) suggests Nitrogen-limited growth phase.
          </div>
        </div>

        {/* 2. Top-Right: HAB Frequency */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-emerald-950 mb-4">Toxic Bloom Events (Seasonal)</h3>
          <div className="h-64 w-full relative">
            {/* Mock Recharts Stacked Bar Chart */}
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
              {/* Bars */}
              <rect x="30" y="100" width="40" height="50" fill="#10b981" />
              <rect x="30" y="90" width="40" height="10" fill="#ef4444" />

              <rect x="100" y="80" width="40" height="70" fill="#10b981" />
              <rect x="100" y="60" width="40" height="20" fill="#ef4444" />

              <rect x="170" y="50" width="40" height="100" fill="#10b981" />
              <rect x="170" y="20" width="40" height="30" fill="#ef4444" />

              <rect x="240" y="70" width="40" height="80" fill="#10b981" />
              <rect x="240" y="60" width="40" height="10" fill="#ef4444" />
            </svg>
          </div>
           <div className="text-xs text-center text-red-700 font-semibold bg-red-50 border border-red-200 p-2 rounded-lg mt-4">
            Monsoon 2024: 3 Toxic Events detected (High Risk).
          </div>
        </div>
      </div>

      {/* Bottom Row: Full Width */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">Diel Vertical Migration & Lunar Influence</h3>
        <div className="h-80 w-full relative">
          {/* Mock Recharts Composed Chart */}
          <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => <line key={i} x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#e2e8f0" strokeWidth="0.5" />)}
            
            {/* Area for Zooplankton */}
            <defs>
              <linearGradient id="zooGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <path d="M 0 100 C 83 20, 83 20, 166 100 S 249 180, 332 100 S 415 20, 500 100 L 500 200 L 0 200 Z" fill="url(#zooGradient)" />
            
            {/* Line for Lunar Illumination */}
            <path d="M 0 100 C 83 180, 83 180, 166 100 S 249 20, 332 100 S 415 180, 500 100" fill="none" stroke="#f59e0b" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-center text-purple-700 font-semibold bg-purple-50 border border-purple-200 p-2 rounded-lg">
            🌙 Biomass peaks during New Moon phases, indicating active surface migration.
          </div>
          <div className="flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500"></div>Zooplankton Biomass</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500"></div>Lunar Illumination</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanktonCharts;
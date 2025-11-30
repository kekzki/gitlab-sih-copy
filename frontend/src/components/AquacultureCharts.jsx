import React from 'react';

const KpiCard = ({ title, value, badgeText, badgeColor }) => {
  const badgeColors = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-3xl font-bold text-emerald-950">{value}</p>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeColors[badgeColor]}`}>
          {badgeText}
        </span>
      </div>
    </div>
  );
};

const AquacultureCharts = () => {
  return (
    <div className="space-y-6">
      {/* Row 1: KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard title="Current Stock Health" value="94%" badgeText="Excellent" badgeColor="green" />
        <KpiCard title="Est. Harvest Date" value="Nov 14" badgeText="On Track" badgeColor="blue" />
        <KpiCard title="Pathogen Load" value="Low Detect" badgeText="Safe" badgeColor="green" />
      </div>

      {/* Row 2: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Disease Risk Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-emerald-950 mb-4">Infection Probability vs. Environmental Stressors</h3>
          <div className="h-80 w-full relative">
            {/* Mock Recharts Composed Chart */}
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid lines */}
              {[...Array(5)].map((_, i) => <line key={i} x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#e2e8f0" strokeWidth="0.5" />)}
              
              {/* Area for Vibrio Risk Zone */}
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <path d="M 300 180 L 350 120 L 400 80 L 450 50 L 500 20 L 500 200 L 300 200 Z" fill="url(#riskGradient)" />
              
              {/* Line for Water Temp */}
              <path d="M 0 180 L 100 170 L 200 150 L 300 120 L 400 100 L 500 90" fill="none" stroke="#3b82f6" strokeWidth="2" />
              
              {/* Line for Pathogen Growth */}
              <path d="M 0 190 L 100 185 L 200 170 L 300 140 L 400 80 L 500 30" fill="none" stroke="#8b5cf6" strokeWidth="2" />
            </svg>
          </div>
          <div className="text-xs text-center text-amber-700 font-semibold bg-amber-50 border border-amber-200 p-2 rounded-lg mt-4">
            ⚠️ Risk increases by 15% if Temp exceeds 29°C for &gt;3 days.
          </div>
        </div>

        {/* Right: Site Suitability Radar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-emerald-950 mb-4">Location Optimization Score</h3>
          <div className="flex-grow flex items-center justify-center">
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
              <polygon points="50,10 90,25 85,70 20,75 15,30" fill="#10b981" fillOpacity="0.4" />
              <polygon points="50,5 93,25 93,75 7,75 7,25" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
              {/* Labels */}
              <text x="42" y="2" fontSize="5" fill="#64748b">O₂ Stability</text>
              <text x="95" y="27" fontSize="5" fill="#64748b">Salinity</text>
              <text x="95" y="78" fontSize="5" fill="#64748b">Tidal Flow</text>
              <text x="-5" y="78" fontSize="5" fill="#64748b">Bottom Type</text>
              <text x="-10" y="27" fontSize="5" fill="#64748b">Predators</text>
            </svg>
          </div>
          <div className="flex justify-center gap-6 text-xs mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"></div>This Site</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border border-slate-500"></div>Ideal Standard</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AquacultureCharts;
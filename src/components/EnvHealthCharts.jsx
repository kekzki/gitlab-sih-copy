import React from 'react';
import { ArrowUp, ArrowDown, Minus, ChevronDown, Download } from 'lucide-react';

const KpiCard = ({ title, value, badgeText, badgeColor, trend }) => {
  const trendIcons = {
    up: <ArrowUp size={16} className="text-green-500" />,
    down: <ArrowDown size={16} className="text-red-500" />,
    flat: <Minus size={16} className="text-blue-500" />,
  };

  const badgeColors = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        {trendIcons[trend]}
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-3xl font-bold text-emerald-950">{value}</p>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeColors[badgeColor]}`}>
          {badgeText}
        </span>
      </div>
    </div>
  );
};

const EnvHealthCharts = () => {
  return (
    <div className="space-y-6">
      {/* Row 1: KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Dissolved Oxygen" value="6.4 mg/L" badgeText="Optimal" badgeColor="green" trend="up" />
        <KpiCard title="Ocean Acidity" value="8.1 pH" badgeText="Stable" badgeColor="blue" trend="flat" />
        <KpiCard title="Water Clarity" value="4.2 NTU" badgeText="Warning" badgeColor="yellow" trend="up" />
        <KpiCard title="Algal Biomass" value="1.2 mg/m³" badgeText="Optimal" badgeColor="green" trend="down" />
      </div>

      {/* Row 2: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-emerald-950">Water Quality Composite Index</h3>
            <button className="flex items-center gap-1 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-100">
              Last 30 Days <ChevronDown size={16} />
            </button>
          </div>
          <div className="h-80 w-full relative">
            {/* Mock Recharts Composed Chart */}
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid lines */}
              {[...Array(5)].map((_, i) => <line key={i} x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#e2e8f0" strokeWidth="0.5" />)}
              
              {/* Area for Health Score */}
              <defs>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <path d="M 0 100 L 50 90 L 100 110 L 150 80 L 200 70 L 250 90 L 300 80 L 350 60 L 400 70 L 450 50 L 500 60 L 500 200 L 0 200 Z" fill="url(#healthGradient)" />
              
              {/* Line for Dissolved Oxygen */}
              <path d="M 0 80 L 50 70 L 100 90 L 150 60 L 200 50 L 250 70 L 300 60 L 350 40 L 400 50 L 450 30 L 500 40" fill="none" stroke="#3b82f6" strokeWidth="2" />
              
              {/* Dashed Line for Turbidity */}
              <path d="M 0 150 L 50 140 L 100 160 L 150 130 L 200 120 L 250 140 L 300 130 L 350 110 L 400 120 L 450 100 L 500 110" fill="none" stroke="#a16207" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>

        {/* Right: Pollution Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-emerald-950">Contaminant Composition</h3>
            <button className="text-slate-400 hover:text-slate-800">
              <Download size={18} />
            </button>
          </div>
          <div className="flex-grow flex flex-col items-center justify-center">
            {/* Mock Recharts Donut Chart */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="40, 100" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#475569" strokeWidth="4" strokeDasharray="15, 100" strokeDashoffset="-40" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#052e16" strokeWidth="4" strokeDasharray="20, 100" strokeDashoffset="-55" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="25, 100" strokeDashoffset="-75" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-500">Total Load</span>
                <span className="text-2xl font-bold text-emerald-950">450 Tons</span>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Plastics: 40%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-600"></div><span>Heavy Metals: 15%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-950"></div><span>Hydrocarbons: 20%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span>Nutrients: 25%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvHealthCharts;
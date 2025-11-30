import React from 'react';
import { Star } from 'lucide-react';

const PredictiveCharts = () => {
  return (
    <div className="space-y-6">
      {/* 1. Top Row: AI Hotspot Probability */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">Species Occurrence Probability (MaxEnt Model)</h3>
        <div className="h-96 w-full bg-slate-50 rounded-lg relative p-4">
          {/* Mock Recharts Scatter Chart as Heatmap */}
          <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
            {/* Grid of dots */}
            {Array.from({ length: 20 }).map((_, y) =>
              Array.from({ length: 40 }).map((_, x) => {
                const isHotspot = x > 25 && x < 35 && y > 5 && y < 15;
                const prob = isHotspot ? 0.8 + Math.random() * 0.2 : Math.random() * 0.4;
                let color;
                if (prob > 0.8) color = '#a855f7'; // Purple
                else if (prob > 0.6) color = '#8b5cf6'; // Violet
                else if (prob > 0.2) color = '#3b82f6'; // Blue
                else color = '#60a5fa'; // Light Blue
                return <circle key={`${x}-${y}`} cx={x * 10 + 5} cy={y * 10 + 5} r="4" fill={color} opacity={prob} />;
              })
            )}
            {/* Overlay: Recommended Site */}
            <g transform="translate(300, 100)" className="cursor-pointer">
              <Star className="text-yellow-300" fill="currentColor" stroke="black" strokeWidth={0.5} size={24} />
              <text x="15" y="5" fontSize="8" fill="white" className="font-bold">Recommended Site</text>
            </g>
          </svg>
          <div className="absolute bottom-4 right-4 text-xs font-semibold text-slate-500">
            Probability Score: <span className="text-blue-500">0.0 (Low)</span> → <span className="text-purple-500">1.0 (High)</span>
          </div>
        </div>
        <div className="text-xs text-center text-purple-700 font-semibold bg-purple-50 border border-purple-200 p-2 rounded-lg mt-4">
          📍 AI identifies Grid Sector B-4 as a high-value zone for <i className="font-bold">Tuna</i> spawning.
        </div>
      </div>

      {/* 2. Bottom Row: Environmental Forecast */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">7-Day Ecosystem Risk Forecast</h3>
        <div className="h-80 w-full relative">
          {/* Mock Recharts Stacked Area Chart */}
          <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => <line key={i} x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#e2e8f0" strokeWidth="0.5" />)}
            
            {/* Stacked Areas */}
            <defs>
              <linearGradient id="hypoxiaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/></linearGradient>
              <linearGradient id="algalGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/><stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/></linearGradient>
              <linearGradient id="acidityGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.6}/><stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/></linearGradient>
            </defs>
            
            {/* Layer 1: Hypoxia */}
            <path d="M 0 200 L 0 180 C 83 170, 166 190, 250 180 S 417 160, 500 170 L 500 200 Z" fill="url(#hypoxiaGradient)" />
            {/* Layer 2: Algal Bloom */}
            <path d="M 0 180 C 83 170, 166 190, 250 180 S 417 160, 500 170 L 500 140 C 417 130, 333 150, 250 140 S 83 120, 0 130 Z" fill="url(#algalGradient)" />
            {/* Layer 3: Acidity */}
            <path d="M 0 130 C 83 120, 166 140, 250 140 S 417 130, 500 140 L 500 100 C 417 90, 333 110, 250 100 S 83 80, 0 90 Z" fill="url(#acidityGradient)" />

            {/* Vertical Cursor Line */}
            <line x1="350" y1="0" x2="350" y2="200" stroke="#0f172a" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="350" cy="153" r="4" fill="white" stroke="#f97316" strokeWidth="2" />
            <circle cx="350" cy="165" r="4" fill="white" stroke="#10b981" strokeWidth="2" />
            <circle cx="350" cy="175" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex justify-center gap-6 text-xs mt-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500"></div>Hypoxia Risk</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"></div>Algal Bloom Risk</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500"></div>Acidity Spike Risk</div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveCharts;
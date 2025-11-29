import React from 'react';

const ClimateCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Top-Left: Marine Heatwave Tracker */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">Heatwave Intensity & Duration Events (2024)</h3>
        <div className="h-64 w-full relative">
          {/* Background Month Grid */}
          <div className="absolute inset-0 flex justify-between px-2">
            {[...Array(11)].map((_, i) => <div key={i} className="w-px h-full border-r border-dotted border-slate-200"></div>)}
          </div>
          <div className="absolute -bottom-5 w-full flex justify-around text-xs text-slate-400">
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
          </div>
          {/* Gantt Bars */}
          <div className="absolute inset-0 space-y-4 pt-4">
            <div className="relative h-8 w-full flex items-center">
              <span className="absolute left-0 text-xs font-bold text-slate-500 w-20 text-right pr-2">MHW-24-01</span>
              <div className="absolute h-full bg-yellow-400 rounded-full ml-20" style={{ left: '5%', width: '15%' }}></div>
            </div>
            <div className="relative h-8 w-full flex items-center">
              <span className="absolute left-0 text-xs font-bold text-slate-500 w-20 text-right pr-2">MHW-24-02</span>
              <div className="absolute h-full bg-red-500 rounded-full ml-20" style={{ left: '30%', width: '25%' }}></div>
            </div>
            <div className="relative h-8 w-full flex items-center">
              <span className="absolute left-0 text-xs font-bold text-slate-500 w-20 text-right pr-2">MHW-24-03</span>
              <div className="absolute h-full bg-purple-600 rounded-full ml-20" style={{ left: '60%', width: '8%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top-Right: SST Anomaly Heatmap */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">Sea Surface Temperature Anomalies</h3>
        <div className="flex gap-4 h-64">
          <div className="text-xs font-bold text-slate-500 flex flex-col justify-between items-end">
            <span>2025</span><span>2023</span><span>2021</span>
          </div>
          <div className="flex-grow grid grid-cols-12 grid-rows-6 gap-1">
            {Array.from({ length: 72 }).map((_, i) => {
              const anomaly = (Math.random() * 4) - 2;
              let color;
              if (i > 36 && Math.random() > 0.3) color = `bg-red-${300 + Math.floor(Math.random() * 4) * 100}`;
              else if (anomaly > 1.5) color = 'bg-red-500';
              else if (anomaly > 0.5) color = 'bg-rose-300';
              else if (anomaly < -1.5) color = 'bg-blue-500';
              else if (anomaly < -0.5) color = 'bg-sky-300';
              else color = 'bg-slate-100';
              return <div key={i} className={`w-full h-full rounded-sm ${color}`}></div>;
            })}
          </div>
        </div>
        <div className="text-xs text-slate-500 grid grid-cols-12 gap-1 mt-2 ml-10">
          {['J','F','M','A','M','J','J','A','S','O','N','D'].map(m => <span key={m} className="text-center">{m}</span>)}
        </div>
      </div>

      {/* 3. Bottom-Left: Upwelling vs. Chlorophyll */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">Upwelling Strength & Chlorophyll Response</h3>
        <div className="h-64 w-full relative">
          <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chloroGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <polygon points="0,120 50,100 100,110 150,80 200,90 250,70 300,80 300,150 0,150" fill="url(#chloroGradient)" />
            <path d="M 0 100 L 50 80 L 100 90 L 150 60 L 200 70 L 250 50 L 300 60" fill="none" stroke="#3b82f6" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* 4. Bottom-Right: Thermocline Depth Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">Vertical Temperature Profile</h3>
        <div className="h-64 w-full relative flex">
          <div className="text-xs text-slate-500 flex flex-col justify-between h-full pr-2">
            <span>0m</span><span>100m</span><span>200m</span><span>300m</span><span>400m</span><span>500m</span>
          </div>
          <div className="relative flex-grow bg-slate-50 rounded-lg">
            <svg width="100%" height="100%" viewBox="0 0 150 300" preserveAspectRatio="none">
              {/* Mixed Layer Annotation */}
              <rect x="0" y="0" width="150" height="60" fill="#3b82f6" fillOpacity="0.1" />
              <text x="5" y="15" fontSize="8" fill="#3b82f6">Mixed Layer</text>
              {/* Lines */}
              <path d="M 130,0 130,50 60,100 50,200 50,300" fill="none" stroke="#ef4444" strokeWidth="2" />
              <path d="M 100,0 100,180 60,220 55,300" fill="none" stroke="#3b82f6" strokeWidth="2" />
              <path d="M 115,0 115,120 58,180 52,300" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </div>
        </div>
        <div className="flex justify-center gap-4 text-xs mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500"></div>Summer</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500"></div>Winter</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"></div>Monsoon</div>
        </div>
      </div>
    </div>
  );
};

export default ClimateCharts;
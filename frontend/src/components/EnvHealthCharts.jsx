import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// 1. EXACT PARAMETER LIST FROM YOUR PROMPT
const CATEGORIES = {
  'Biochemical': ['pH Level', 'Dissolved Oxygen', 'CO2 Concentration', 'Total Alkalinity'],
  'Ecological': ['Phytoplankton', 'Zooplankton', 'Chlorophyll-a', 'P:Z Ratio', 'Phyto vs Nutrients'],
  'Human Impact': ['Pollution Index', 'Plastic Debris', 'Oil Contamination', 'Heavy Metals', 'Pesticide Residues'],
  'Physical Oceanography': ['SST', 'Salinity', 'Water Depth', 'Current Velocity', 'Wave Height', 'Thermocline Depth', 'Upwelling Intensity', 'Monsoon Intensity'],
  'Climate Change': ['SST Anomaly', 'El Nino Index', 'Ammonium'],
  'Nutrient Dynamics': ['Nitrate', 'Phosphate', 'Silicate', 'N:P Ratio']
};

const EnvHealthCharts = ({ filters }) => {
  const [selectedParams, setSelectedParams] = useState(['pH Level', 'SST']); // Defaults

  // Mock Data Generators (Replace with API data)
  const timeData = [
    { date: 'Jan', val1: 24, val2: 8.1 }, { date: 'Feb', val1: 25, val2: 8.0 },
    { date: 'Mar', val1: 27, val2: 7.9 }, { date: 'Apr', val1: 29, val2: 7.8 },
    { date: 'May', val1: 31, val2: 7.8 }, { date: 'Jun', val1: 28, val2: 7.9 },
  ];

  const contaminantData = [
    { name: 'Plastics', value: 400, color: '#ef4444' },
    { name: 'Oil', value: 150, color: '#1e293b' },
    { name: 'Heavy Metals', value: 100, color: '#64748b' },
    { name: 'Pesticides', value: 50, color: '#f59e0b' }
  ];

  const habData = [
    { year: '2020', count: 12 }, { year: '2021', count: 19 },
    { year: '2022', count: 8 }, { year: '2023', count: 24 }
  ];

  const diversityData = [
    { year: '2020', richness: 120, shannon: 2.1 },
    { year: '2021', richness: 135, shannon: 2.3 },
    { year: '2022', richness: 128, shannon: 2.2 },
    { year: '2023', richness: 145, shannon: 2.4 }
  ];

  const toggleParam = (param) => {
    if (selectedParams.includes(param)) setSelectedParams(selectedParams.filter(p => p !== param));
    else if (selectedParams.length < 2) setSelectedParams([...selectedParams, param]); // Limit 2 for demo
  };

  return (
    <div className="space-y-8">
      
      {/* 1. PARAMETER TIME-SERIES (The Checklist) */}
      <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
        {/* Left: Category Checklist */}
        <div className="w-full lg:w-1/4 bg-white p-6 rounded-3xl border border-slate-200 overflow-y-auto scrollbar-hide shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 sticky top-0 bg-white pb-2 border-b border-slate-100">
            Parameter Checklist
          </h3>
          <div className="space-y-6">
            {Object.entries(CATEGORIES).map(([cat, items]) => (
              <div key={cat}>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 bg-slate-50 p-1 rounded w-fit">{cat}</h4>
                <div className="space-y-1">
                  {items.map(item => (
                    <label key={item} className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-slate-50 rounded transition-colors">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedParams.includes(item) ? 'bg-cyan-500 border-cyan-500' : 'border-slate-300'}`}>
                        {selectedParams.includes(item) && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                      <input type="checkbox" className="hidden" onChange={() => toggleParam(item)} />
                      <span className={`text-xs font-semibold ${selectedParams.includes(item) ? 'text-cyan-700' : 'text-slate-600'}`}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: The Graph */}
        <div className="w-full lg:w-3/4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Parameter Time-Series</h3>
          <p className="text-xs text-slate-500 mb-6">Comparing: {selectedParams.join(' vs ')} in {filters.location}</p>
          <div className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="val1" stroke="#06b6d4" strokeWidth={3} name={selectedParams[0] || 'Param 1'} />
                <Line yAxisId="right" type="monotone" dataKey="val2" stroke="#10b981" strokeWidth={3} name={selectedParams[1] || 'Param 2'} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. SPECIFIC ENV HEALTH CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Contaminant Composition */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-80">
          <h4 className="font-bold text-slate-900 mb-4">Contaminant Composition</h4>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={contaminantData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {contaminantData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* HAB Frequency */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-80">
          <h4 className="font-bold text-slate-900 mb-4">HAB Frequency (Count/Year)</h4>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={habData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Bloom Events" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Richness vs Diversity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-80">
          <h4 className="font-bold text-slate-900 mb-4">Richness (S) vs Diversity (H')</h4>
          <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={diversityData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="richness" fill="#0ea5e9" barSize={20} radius={[4, 4, 0, 0]} name="Richness (S)" />
              <Line yAxisId="right" type="monotone" dataKey="shannon" stroke="#f59e0b" strokeWidth={2} name="Shannon (H')" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default EnvHealthCharts;
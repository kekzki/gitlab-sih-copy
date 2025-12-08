import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Bar, BarChart
} from "recharts";
import { Loader2 } from 'lucide-react';

// Maps user-friendly labels to actual JSON keys in your database
const PARAM_KEY_MAP = {
  // Biochemical
  "pH Level": "ph",
  "Dissolved Oxygen": "dissolved_oxygen",
  "CO2 Concentration": "co2",
  "Total Alkalinity": "alkalinity",
  // Physical
  "SST": "temperature",
  "Salinity": "salinity",
  "Water Depth": "depth",
  "Current Velocity": "current_speed",
  // Nutrients
  "Nitrate": "nitrate",
  "Phosphate": "phosphate",
  "Silicate": "silicate"
};

const CATEGORIES = {
  Biochemical: ["pH Level", "Dissolved Oxygen", "CO2 Concentration"],
  Physical: ["SST", "Salinity", "Water Depth", "Current Velocity"],
  Nutrients: ["Nitrate", "Phosphate", "Silicate"]
};

// Mock data for charts not yet supported by backend
const MOCK_CONTAMINANTS = [
  { name: 'Plastic', value: 45, color: '#f87171' },
  { name: 'Oil', value: 25, color: '#fbbf24' },
  { name: 'Heavy Metals', value: 20, color: '#60a5fa' },
  { name: 'Pesticides', value: 10, color: '#a78bfa' },
];

const MOCK_HAB = [
  { year: 2020, count: 2 },
  { year: 2021, count: 5 },
  { year: 2022, count: 3 },
  { year: 2023, count: 8 },
  { year: 2024, count: 4 },
];

const EnvHealthCharts = ({ filters }) => {
  const [selectedParams, setSelectedParams] = useState(["pH Level", "SST"]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch generic oceanographic parameters
        // Filters: Region + Date Range (defaulting to last 2 years for trend)
        const regionParam = filters?.region ? `&region=${filters.region}` : '';
        const url = `/api/oceanographic/parameters?start_date=2022-01-01${regionParam}`;
        
        const res = await fetch(url);
        const json = await res.json();

        if (json && Array.isArray(json)) {
          // Process raw backend data into Recharts format
          const processed = json.map(item => {
            const dataPoint = {
              date: item.Data.eventdate || 'Unknown',
              // Spread all potential keys for easy access
              ...item.Data 
            };
            
            // Normalize keys (ensure numbers are floats)
            Object.keys(PARAM_KEY_MAP).forEach(label => {
              const key = PARAM_KEY_MAP[label];
              if (dataPoint[key]) {
                dataPoint[label] = parseFloat(dataPoint[key]);
              }
            });
            
            return dataPoint;
          }).sort((a, b) => new Date(a.date) - new Date(b.date));

          setChartData(processed);
        }
      } catch (err) {
        console.error("Failed to fetch environmental data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]); // Re-run when filters change

  const toggleParam = (p) => {
    if (selectedParams.includes(p)) {
      setSelectedParams(selectedParams.filter((x) => x !== p));
    } else if (selectedParams.length < 2) {
      setSelectedParams([...selectedParams, p]);
    }
  };

  return (
    <div className="space-y-8">

      {/* 1. PARAMETER TIME-SERIES */}
      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">

        {/* Checklist Sidebar */}
        <div className="w-full lg:w-1/4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-y-auto">
          <h3 className="font-bold text-slate-900 mb-4">Parameter Checklist</h3>
          <p className="text-xs text-slate-400 mb-4">Select up to 2 parameters to compare.</p>

          {Object.entries(CATEGORIES).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">{cat}</h4>
              <div className="space-y-1">
                {items.map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors border
                      ${selectedParams.includes(item) 
                        ? 'bg-cyan-50 border-cyan-200' 
                        : 'border-transparent hover:bg-slate-50'}`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selectedParams.includes(item)
                          ? "bg-cyan-500 border-cyan-500"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedParams.includes(item) && (
                        <span className="text-white text-[10px] font-bold">✓</span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedParams.includes(item)}
                      onChange={() => toggleParam(item)}
                      disabled={!selectedParams.includes(item) && selectedParams.length >= 2}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        selectedParams.includes(item) ? "text-cyan-900" : "text-slate-600"
                      }`}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Chart Area */}
        <div className="w-full lg:w-3/4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col relative">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Environmental Time-Series</h3>
          <p className="text-xs text-slate-500 mb-6">
            Comparing: <span className="font-bold text-cyan-600">{selectedParams.join(" vs ")}</span> 
            {filters?.region && <span> in {filters.region}</span>}
          </p>

          <div className="flex-1 min-h-[400px] relative">
            {loading && (
               <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                 <Loader2 className="animate-spin text-cyan-600" size={32} />
               </div>
            )}
            
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10}} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', year:'2-digit'})}
                  />
                  <YAxis yAxisId="left" tick={{fontSize: 10}} />
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{color: '#64748b', fontSize: '12px', marginBottom: '4px'}}
                  />
                  <Legend />
                  {selectedParams.map((p, i) => (
                    <Line
                      key={p}
                      yAxisId={i === 0 ? "left" : "right"}
                      type="monotone"
                      dataKey={p}
                      strokeWidth={3}
                      stroke={i === 0 ? "#06b6d4" : "#f59e0b"}
                      dot={false}
                      activeDot={{r: 6}}
                      name={p}
                      animationDuration={1000}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              !loading && (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No data available for the selected region/parameters.
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* 2. SECONDARY CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Contaminant Composition (Mock Data) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-80 flex flex-col">
          <h4 className="font-bold text-slate-900 mb-2">Contaminant Composition</h4>
          <p className="text-[10px] text-slate-400 mb-4">Relative abundance of pollutants (Simulated)</p>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={MOCK_CONTAMINANTS} 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {MOCK_CONTAMINANTS.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '10px'}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HAB Frequency (Mock Data) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-80 flex flex-col">
          <h4 className="font-bold text-slate-900 mb-2">Algal Bloom Events</h4>
          <p className="text-[10px] text-slate-400 mb-4">Recorded Harmful Algal Blooms (HABs) per year</p>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_HAB}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Events" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Richness vs Diversity (Using Real Data if Available, else Placeholder) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-80 flex flex-col">
          <h4 className="font-bold text-slate-900 mb-2">Richness vs Diversity</h4>
          <p className="text-[10px] text-slate-400 mb-4">Species count (S) vs Shannon Index (H')</p>
          <div className="flex-grow flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            [See Biodiversity Tab for Details]
          </div>
        </div>

      </div>
    </div>
  );
};

export default EnvHealthCharts;

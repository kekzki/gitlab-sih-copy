import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';

// --- Configuration Mapping (Must match Go/Python logic) ---
const PARAM_KEY_MAP = {
    "pH Level": "pHLevel",
    "Dissolved Oxygen": "dissolvedOxygen_milligramsPerLiter",
    "CO2 Concentration": "CO2_microatm",
    "Total Alkalinity": "alkalinity_micromolPeriKilogram",
    "SST": "SST_degreeCelcius",
    "Salinity": "salinity_PSU",
    "Water Depth": "minimumDepthInMeters",
    "Current Velocity": "currentVelocity_metersPerSecond",
    "Nitrate": "nitrate_micromolPerLitre",
    "Phosphate": "phosphate_micromolPerLitre",
    "Silicate": "silicate_micromolPerLitre",
};

const CATEGORIES = {
  Biochemical: ["pH Level", "Dissolved Oxygen", "CO2 Concentration", "Total Alkalinity"],
  Physical: ["SST", "Salinity", "Water Depth", "Current Velocity"],
  Nutrients: ["Nitrate", "Phosphate", "Silicate"],
};

// Map parameter to a unique color for the charts
const PARAM_COLORS = {
    "pH Level": "#06b6d4",        // Cyan
    "Dissolved Oxygen": "#f59e0b", // Amber
    "CO2 Concentration": "#ef4444", // Red
    "Total Alkalinity": "#84cc16",  // Lime
    "SST": "#3b82f6",             // Blue
    "Salinity": "#a855f7",        // Violet
    "Water Depth": "#10b981",     // Emerald
    "Current Velocity": "#f97316", // Orange
    "Nitrate": "#6366f1",         // Indigo
    "Phosphate": "#ec4899",       // Pink
    "Silicate": "#6b7280",        // Gray
};

const allParameters = Object.values(CATEGORIES).flat();

const MultiParamCharts = ({ filters }) => {
  // Use a map to track visibility: { "pH Level": true, "SST": true, ... }
  const [paramVisibility, setParamVisibility] = useState(() => {
    return allParameters.reduce((acc, param) => {
        // Default: pH Level and SST are visible, the rest are hidden
        acc[param] = param === "pH Level" || param === "SST"; 
        return acc;
    }, {});
  });
  
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setChartData([]); 

    const regionParam = filters?.region ? `&region=${filters.region}` : '';
    const twoYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString().split('T')[0];
    const startDateParam = filters?.startDate || twoYearsAgo;
    
    // NOTE: This URL must match your Go backend's endpoint
    const url = `/api/oceanographic/parameters?start_date=${startDateParam}${regionParam}`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      
      if (json && Array.isArray(json)) {
        // Data is already processed and normalized by the Go backend
        const sortedData = json.sort((a, b) => new Date(a.date) - new Date(b.date));
        setChartData(sortedData);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error("Failed to fetch environmental data:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- UI Logic ---
  const toggleVisibility = (p) => {
    setParamVisibility(prev => ({
        ...prev,
        [p]: !prev[p]
    }));
  };

  const getFilteredData = (paramKey) => {
    // Filter out data points where the specific parameter is null or undefined
    return chartData.filter(item => item[paramKey] !== undefined && item[paramKey] !== null);
  }

  // Finds the parameter's corresponding raw key (e.g., 'pH Level' -> 'pHLevel')
  const getRawKey = (label) => PARAM_KEY_MAP[label];

  // Component to render a single Line Chart
  const SingleParameterChart = ({ paramLabel, data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-slate-400">
                No data points recorded for this parameter in the selected period.
            </div>
        );
    }
    
    const color = PARAM_COLORS[paramLabel];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10}} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', year:'2-digit'})}
                />
                {/* Single Y-Axis per chart */}
                <YAxis yAxisId="left" tick={{fontSize: 10}} domain={['auto', 'auto']} /> 
                
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: `1px solid ${color}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{color: '#64748b', fontSize: '12px', marginBottom: '4px'}}
                />
                <Legend />
                
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey={paramLabel}
                    strokeWidth={3}
                    stroke={color}
                    dot={false}
                    activeDot={{r: 6}}
                    name={paramLabel}
                    animationDuration={500}
                />
            </LineChart>
        </ResponsiveContainer>
    );
  };


  // --- Main Render ---
  return (
    <div className="flex">
        
        {/* Sidebar for Parameter Checklist */}
        <div 
            className={`transition-all duration-300 ${sidebarOpen ? 'w-full lg:w-1/4' : 'w-12 lg:w-16'} 
                       bg-white p-4 rounded-3xl border border-slate-200 shadow-sm overflow-y-auto relative z-10`}
        >
            <div className={`flex items-start ${sidebarOpen ? 'justify-between' : 'justify-center'} mb-4`}>
                {sidebarOpen && <h3 className="font-bold text-slate-900">Parameters</h3>}
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                    title={sidebarOpen ? "Collapse" : "Expand"}
                >
                    {sidebarOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>
            
            {sidebarOpen && (
                <>
                <p className="text-xs text-slate-400 mb-4">Select parameters to display charts.</p>
                {Object.entries(CATEGORIES).map(([cat, items]) => (
                    <div key={cat} className="mb-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">{cat}</h4>
                        <div className="space-y-1">
                            {items.map((item) => (
                                <label
                                    key={item}
                                    className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors border
                                        ${paramVisibility[item] ? 'bg-indigo-50 border-indigo-200' : 'border-transparent hover:bg-slate-50'}`}
                                >
                                    <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                            paramVisibility[item] ? "bg-indigo-500 border-indigo-500" : "border-slate-300 bg-white"
                                        }`}
                                    >
                                        {paramVisibility[item] && <span className="text-white text-[10px] font-bold">✓</span>}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={paramVisibility[item]}
                                        onChange={() => toggleVisibility(item)}
                                    />
                                    <span className={`text-xs font-semibold ${paramVisibility[item] ? "text-indigo-900" : "text-slate-600"}`}>
                                        {item}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                </>
            )}
        </div>

        {/* Main Chart Grid Area */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-full lg:w-3/4 ml-6' : 'w-full'} space-y-6`}>
            
            {/* Conditional Loading State */}
            {loading ? (
                <div className="flex items-center justify-center h-full min-h-[500px] bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ITERATE OVER ALL PARAMETERS TO RENDER CHARTS BASED ON VISIBILITY */}
                    {allParameters.map((paramLabel) => {
                        if (paramVisibility[paramLabel]) {
                            const data = getFilteredData(paramLabel);
                            const rawKey = getRawKey(paramLabel);
                            
                            return (
                                <div 
                                    key={paramLabel} 
                                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg h-[350px] flex flex-col"
                                >
                                    <h4 className="font-bold text-slate-900 mb-1">{paramLabel}</h4>
                                    <p className="text-[10px] text-slate-500 mb-4">
                                        Data Key: **{rawKey}** {filters?.region && <span> | Region: {filters.region}</span>}
                                    </p>
                                    
                                    <div className="flex-grow min-h-0">
                                        <SingleParameterChart paramLabel={paramLabel} data={data} />
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}
                    
                    {/* Fallback Message if no charts are visible */}
                    {Object.values(paramVisibility).every(v => v === false) && (
                        <div className="md:col-span-2 flex items-center justify-center h-32 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500">
                            Select at least one parameter from the sidebar to view its time-series chart.
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default MultiParamCharts;
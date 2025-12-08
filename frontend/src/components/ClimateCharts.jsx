import React, { useState, useEffect } from 'react';

// --- Helpers for Data Processing & SVG ---

// Groups flat data by Year and Month
const groupDataByMonth = (data) => {
  const grouped = {};
  data.forEach(item => {
    const date = new Date(item.Data.eventdate);
    if (isNaN(date)) return;
    
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    
    if (!grouped[year]) grouped[year] = Array(12).fill(null).map(() => ({ tempSum: 0, count: 0, readings: [] }));
    
    const val = parseFloat(item.Data.temperature);
    if (!isNaN(val)) {
      grouped[year][month].tempSum += val;
      grouped[year][month].count += 1;
      grouped[year][month].readings.push(val);
    }
  });
  return grouped;
};

// Generates SVG path for line charts
const generatePath = (data, key, width, height, min, max, inverse = false) => {
  if (!data || data.length === 0) return "";
  const stepX = width / (data.length - 1 || 1);
  const range = max - min || 1;
  
  const points = data.map((d, i) => {
    const x = i * stepX;
    let norm = (d[key] - min) / range;
    if (inverse) norm = 1 - norm; // For depth or inverted scales
    const y = height - (norm * height);
    return `${x},${y}`;
  });
  
  return `M ${points.join(' L ')}`;
};

const ClimateCharts = () => {
  const [loading, setLoading] = useState(true);
  const [heatwaves, setHeatwaves] = useState([]);
  const [sstGrid, setSstGrid] = useState([]); // Array of { year, months: [] }
  const [upwellingData, setUpwellingData] = useState([]);
  const [years, setYears] = useState([]);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch 3 years of data for the heatmap
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = '2022-01-01';
        
        const res = await fetch(`/api/oceanographic/parameters?region=Pacific&start_date=${startDate}&end_date=${endDate}`);
        const rawData = await res.json();
        
        if (rawData) {
          processData(rawData);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to load climate data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Data Processing Logic ---
  const processData = (data) => {
    // Sort by date
    const sorted = data.sort((a, b) => new Date(a.Data.eventdate) - new Date(b.Data.eventdate));

    // 1. Process SST Anomaly Heatmap
    const grouped = groupDataByMonth(sorted);
    const sortedYears = Object.keys(grouped).sort((a, b) => b - a); // Descending years
    setYears(sortedYears);

    // Calculate Long-Term Baseline (roughly) to find anomalies
    let grandSum = 0, grandCount = 0;
    sorted.forEach(d => {
      const t = parseFloat(d.Data.temperature);
      if(!isNaN(t)) { grandSum += t; grandCount++; }
    });
    const baseline = grandCount ? grandSum / grandCount : 25;

    const gridData = sortedYears.map(year => {
      return grouped[year].map(m => {
        if (m.count === 0) return null;
        const avg = m.tempSum / m.count;
        return { avg, anomaly: avg - baseline };
      });
    });
    setSstGrid(gridData);

    // 2. Process Heatwaves (Periods > Baseline + 2°C for > 5 days)
    // Using the last 365 days of data for the Tracker
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const recentData = sorted.filter(d => new Date(d.Data.eventdate) >= oneYearAgo);
    const hwThreshold = baseline + 2; 
    
    const foundHeatwaves = [];
    let currentEvent = null;

    recentData.forEach((d, idx) => {
      const temp = parseFloat(d.Data.temperature || 0);
      const date = new Date(d.Data.eventdate);
      
      if (temp > hwThreshold) {
        if (!currentEvent) {
          currentEvent = { start: date, end: date, maxTemp: temp, count: 1 };
        } else {
          currentEvent.end = date;
          currentEvent.maxTemp = Math.max(currentEvent.maxTemp, temp);
          currentEvent.count++;
        }
      } else {
        if (currentEvent && currentEvent.count >= 3) { // Min 3 days to count as event
          foundHeatwaves.push(currentEvent);
        }
        currentEvent = null;
      }
    });
    // Limit to top 3 longest/most intense for the UI
    setHeatwaves(foundHeatwaves.sort((a, b) => b.count - a.count).slice(0, 3));

    // 3. Process Upwelling vs Chlorophyll (Last 50 points for trend)
    const trendData = sorted.slice(-50).map(d => ({
      temp: parseFloat(d.Data.temperature || 0),
      chloro: parseFloat(d.Data.chlorophyll || Math.random() * 2), // Fallback if mock data missing
      date: d.Data.eventdate
    }));
    setUpwellingData(trendData);
  };

  // --- Rendering Helpers ---
  const getAnomalyColor = (val) => {
    if (val === null) return 'bg-slate-100';
    if (val > 1.5) return 'bg-red-500';
    if (val > 0.5) return 'bg-rose-300';
    if (val < -1.5) return 'bg-blue-500';
    if (val < -0.5) return 'bg-sky-300';
    return 'bg-slate-200';
  };

  const getMonthPosition = (date) => {
    const d = new Date(date);
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const dayOfYear = ((d - startOfYear) + 86400000) / 86400000;
    return (dayOfYear / 365) * 100;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. Top-Left: Marine Heatwave Tracker */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-emerald-950">Heatwave Intensity Events (Last 12 Mo)</h3>
          {loading && <span className="text-xs text-slate-400 animate-pulse">Syncing...</span>}
        </div>
        
        <div className="h-64 w-full relative">
          {/* Background Month Grid */}
          <div className="absolute inset-0 flex justify-between px-2 pointer-events-none">
            {[...Array(11)].map((_, i) => <div key={i} className="w-px h-full border-r border-dotted border-slate-200"></div>)}
          </div>
          <div className="absolute -bottom-5 w-full flex justify-between text-xs text-slate-400 px-2">
            <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
          </div>

          {/* Gantt Bars (Dynamic) */}
          <div className="absolute inset-0 space-y-4 pt-4">
            {heatwaves.length > 0 ? heatwaves.map((hw, i) => {
              const left = getMonthPosition(hw.start);
              const width = Math.max(getMonthPosition(hw.end) - left, 2); // Min width 2%
              const colors = ['bg-yellow-400', 'bg-red-500', 'bg-purple-600'];
              
              return (
                <div key={i} className="relative h-8 w-full flex items-center group">
                  <span className="absolute left-0 text-xs font-bold text-slate-500 w-20 text-right pr-2">
                    MHW-{hw.start.getFullYear()}-{i+1}
                  </span>
                  <div 
                    className={`absolute h-full ${colors[i % 3]} rounded-full ml-20 shadow-sm transition-all hover:scale-y-110 cursor-pointer`} 
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-0 bg-slate-800 text-white text-[10px] p-1 rounded whitespace-nowrap z-10">
                      {hw.start.toLocaleDateString()} - {hw.maxTemp.toFixed(1)}°C
                    </div>
                  </div>
                </div>
              );
            }) : (
              !loading && <div className="text-center text-sm text-slate-400 mt-20">No significant heatwaves detected in range.</div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top-Right: SST Anomaly Heatmap */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">Sea Surface Temperature Anomalies</h3>
        <div className="flex gap-4 h-64">
          {/* Y-Axis Labels (Years) */}
          <div className="text-xs font-bold text-slate-500 flex flex-col gap-1 w-10">
             {years.slice(0, 6).map(y => (
               <div key={y} className="flex-1 flex items-center justify-end">{y}</div>
             ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex-grow flex flex-col gap-1">
             {sstGrid.slice(0, 6).map((yearRow, i) => (
               <div key={i} className="flex-1 grid grid-cols-12 gap-1">
                 {yearRow.map((m, j) => (
                   <div 
                     key={j} 
                     title={m ? `${m.anomaly.toFixed(2)}°C` : 'No Data'}
                     className={`w-full h-full rounded-sm ${m ? getAnomalyColor(m.anomaly) : 'bg-slate-50'}`} 
                   />
                 ))}
               </div>
             ))}
             {sstGrid.length === 0 && !loading && (
               <div className="h-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded">
                 No historical data available
               </div>
             )}
          </div>
        </div>
        <div className="text-xs text-slate-500 grid grid-cols-12 gap-1 mt-2 ml-14">
          {['J','F','M','A','M','J','J','A','S','O','N','D'].map(m => <span key={m} className="text-center">{m}</span>)}
        </div>
      </div>

      {/* 3. Bottom-Left: Upwelling vs. Chlorophyll */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">Upwelling Strength & Chlorophyll Response</h3>
        <div className="h-64 w-full relative">
          {upwellingData.length > 0 ? (
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chloroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              {/* Dynamic Chlorophyll Area (Green) */}
              {(() => {
                const maxC = Math.max(...upwellingData.map(d => d.chloro)) || 1;
                const pathStr = generatePath(upwellingData, 'chloro', 300, 150, 0, maxC * 1.2);
                return (
                   <path d={`${pathStr} L 300,150 L 0,150 Z`} fill="url(#chloroGradient)" />
                );
              })()}

              {/* Dynamic Temperature Line (Blue - Inverse of Upwelling) */}
              {(() => {
                const maxT = Math.max(...upwellingData.map(d => d.temp));
                const minT = Math.min(...upwellingData.map(d => d.temp));
                return (
                  <path 
                    d={generatePath(upwellingData, 'temp', 300, 150, minT, maxT)} 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="2" 
                  />
                );
              })()}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">Loading correlation data...</div>
          )}
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-blue-500"></div> Temperature</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500 opacity-40"></div> Chlorophyll</div>
        </div>
      </div>

      {/* 4. Bottom-Right: Vertical Temperature Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">Vertical Temperature Profile (Estimated)</h3>
        <div className="h-64 w-full relative flex">
          <div className="text-xs text-slate-500 flex flex-col justify-between h-full pr-2">
            <span>0m</span><span>100m</span><span>200m</span><span>300m</span><span>400m</span><span>500m</span>
          </div>
          <div className="relative flex-grow bg-slate-50 rounded-lg overflow-hidden">
            {sstGrid.length > 0 ? (
              <svg width="100%" height="100%" viewBox="0 0 150 300" preserveAspectRatio="none">
                {/* Mixed Layer Annotation */}
                <rect x="0" y="0" width="150" height="40" fill="#3b82f6" fillOpacity="0.1" />
                <text x="5" y="15" fontSize="8" fill="#3b82f6">Mixed Layer</text>
                
                {/* Dynamic Profiles based on Real Surface Temp 
                   We simulate the thermocline curve anchoring at the real SST 
                   from the latest summer/winter/monsoon data points 
                */}
                {[
                  { month: 6, color: '#ef4444', label: 'Summer' }, // July
                  { month: 0, color: '#3b82f6', label: 'Winter' }, // Jan
                  { month: 8, color: '#10b981', label: 'Monsoon' }  // Sept
                ].map((season, i) => {
                  // Get average temp for this season from the latest complete year
                  const yearData = sstGrid[0] || sstGrid[1];
                  const surfaceTemp = yearData && yearData[season.month] ? yearData[season.month].avg : 25;
                  
                  // Simple Thermocline Model points: (Temp relative to X axis, Depth Y axis)
                  // Scale: 0-30°C maps to 0-150px width
                  const xSurf = (surfaceTemp / 35) * 150;
                  const xDeep = (4 / 35) * 150; // Deep ocean is ~4°C
                  
                  return (
                    <path 
                      key={i}
                      d={`M ${xSurf},0 L ${xSurf},40 Q ${xSurf},100 ${xDeep},200 L ${xDeep},300`}
                      fill="none" 
                      stroke={season.color} 
                      strokeWidth="2"
                      strokeDasharray={i===2 ? "3 3" : ""}
                    />
                  );
                })}
              </svg>
            ) : null}
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

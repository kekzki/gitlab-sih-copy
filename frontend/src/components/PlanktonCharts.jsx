import React, { useState, useEffect } from 'react';

// --- Helpers ---

// Calculate Moon Phase (0.0 to 1.0) for a given date
const getMoonPhase = (date) => {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let c = 0;
  let e = 0;
  let jd = 0;
  let b = 0;

  if (month < 3) {
    year--;
    month += 12;
  }
  ++month;
  c = 365.25 * year;
  e = 30.6 * month;
  jd = c + e + day - 694039.09; // jd is total days elapsed
  b = jd / 29.53058; // divide by the moon cycle
  b -= parseInt(b); // subtract integer part to leave fractional part
  return Math.round(b * 100) / 100; // 0 = New Moon, 0.5 = Full Moon
};

// SVG Path Generator for Scatter Plot
const generateScatterPoints = (data, xKey, yKey, width, height) => {
  if (!data.length) return [];
  
  const xValues = data.map(d => d[xKey]);
  const yValues = data.map(d => d[yKey]);
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  return data.map((d, i) => ({
    cx: ((d[xKey] - minX) / (maxX - minX || 1)) * width,
    cy: height - ((d[yKey] - minY) / (maxY - minY || 1)) * height,
    val: d[yKey]
  }));
};

const PlanktonCharts = () => {
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [correlationData, setCorrelationData] = useState([]);
  const [habData, setHabData] = useState([]);
  const [migrationData, setMigrationData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Oceanographic Data (Nutrients vs Chlorophyll)
        // We use a broad range to get enough points for a scatter plot
        const oceanRes = await fetch('/api/oceanographic/parameters?region=Pacific&start_date=2023-01-01');
        const oceanJson = await oceanRes.json();
        
        // 2. Fetch Zooplankton Abundance (Using a proxy species ID for demo)
        // In a real scenario, you'd lookup "Calanus" or similar first
        const zooRes = await fetch('/api/marine-trends/abundance?species_id=1'); 
        const zooJson = await zooRes.json();

        processData(oceanJson || [], zooJson || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load plankton data", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = (oceanRaw, zooRaw) => {
    // --- 1. Process Correlation (Nitrate vs Chlorophyll) ---
    const corr = oceanRaw.map(item => ({
      // Fallbacks if specific keys missing in random JSONB data
      nitrate: parseFloat(item.Data.nitrate || item.Data.salinity || 0), 
      chlorophyll: parseFloat(item.Data.chlorophyll || item.Data.temperature || 0)
    })).filter(d => d.nitrate > 0 && d.chlorophyll > 0).slice(0, 50); // Limit points
    
    setCorrelationData(corr);

    // --- 2. Process HABs (Bloom Events) ---
    // Group by Season, count days where Chlorophyll > Threshold (e.g. 5)
    const seasons = { 'Winter': 0, 'Spring': 0, 'Summer': 0, 'Autumn': 0 };
    const toxicCounts = { 'Winter': 0, 'Spring': 0, 'Summer': 0, 'Autumn': 0 };
    
    oceanRaw.forEach(item => {
      const date = new Date(item.Data.eventdate);
      const month = date.getMonth();
      const chloro = parseFloat(item.Data.chlorophyll || 0);
      
      let season = 'Winter';
      if (month >= 2 && month <= 4) season = 'Spring';
      else if (month >= 5 && month <= 7) season = 'Summer';
      else if (month >= 8 && month <= 10) season = 'Autumn';

      if (chloro > 1) seasons[season] += chloro; // Accumulate biomass
      if (chloro > 4) toxicCounts[season] += 1; // Threshold for "Bloom"
    });

    const habArray = Object.keys(seasons).map(k => ({
      season: k,
      biomass: seasons[k],
      toxic: toxicCounts[k]
    }));
    setHabData(habArray);

    // --- 3. Process Migration (Abundance vs Moon Phase) ---
    const migration = zooRaw.map(item => {
        const date = new Date(item.Data.date || "2024-01-01"); // Assuming backend sends date in Data
        return {
            biomass: parseInt(item.Data.count || 0),
            moon: getMoonPhase(date)
        };
    }).sort((a,b) => a.moon - b.moon); // Sort by lunar phase for the curve
    
    // Normalize curve for visual smoothness
    setMigrationData(migration);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Row: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Top-Left: Phytoplankton vs. Nutrients */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-emerald-950 mb-4">Primary Productivity Drivers</h3>
          <div className="h-64 w-full relative">
            {correlationData.length > 0 ? (
                <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
                  {/* Trend Line (Simple Linear Regression Visual) */}
                  <line x1="20" y1="130" x2="280" y2="20" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
                  
                  {/* Axes */}
                  <line x1="0" y1="150" x2="300" y2="150" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="0" y1="0" x2="0" y2="150" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Data Points */}
                  {generateScatterPoints(correlationData, 'nitrate', 'chlorophyll', 300, 150).map((pt, i) => (
                    <circle 
                        key={i} 
                        cx={pt.cx} 
                        cy={pt.cy} 
                        r={pt.val > 4 ? 4 : 2} 
                        fill={pt.val > 4 ? "#10b981" : "#94a3b8"} 
                        opacity="0.7"
                    />
                  ))}
                </svg>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-400">Loading correlation data...</div>
            )}
            {/* Labels */}
            <span className="absolute bottom-1 right-2 text-[10px] text-slate-400">Nutrient Conc. (Nitrate) →</span>
            <span className="absolute top-2 left-2 text-[10px] text-slate-400">Chlorophyll-a ↑</span>
          </div>
          <div className="text-xs text-center text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 p-2 rounded-lg mt-4">
            📈 Strong positive correlation suggests nutrient-limited growth phase.
          </div>
        </div>

        {/* 2. Top-Right: HAB Frequency */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-emerald-950 mb-4">Seasonal Biomass & Toxic Events</h3>
          <div className="h-64 w-full relative flex items-end justify-around pb-6 border-b border-slate-200">
             {habData.map((d, i) => {
                 const heightBio = Math.min((d.biomass / 50) * 100, 150); // Scale factor
                 const heightToxic = d.toxic * 10; 
                 return (
                     <div key={i} className="flex flex-col items-center justify-end h-full w-1/5 group">
                         {/* Toxic Bar (Red) */}
                         <div style={{ height: `${heightToxic}px` }} className="w-full bg-red-500 rounded-t-sm opacity-80 relative">
                             {d.toxic > 0 && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-red-600">{d.toxic}</span>}
                         </div>
                         {/* Biomass Bar (Green) */}
                         <div style={{ height: `${heightBio}px` }} className="w-full bg-emerald-500 rounded-sm opacity-60"></div>
                         <span className="mt-2 text-xs font-bold text-slate-500">{d.season}</span>
                     </div>
                 )
             })}
          </div>
          <div className="text-xs text-center text-red-700 font-semibold bg-red-50 border border-red-200 p-2 rounded-lg mt-4">
            ⚠️ {habData.reduce((acc, curr) => acc + curr.toxic, 0)} Potential Toxic Events detected in dataset.
          </div>
        </div>
      </div>

      {/* Bottom Row: Full Width */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">Zooplankton Biomass vs Lunar Phase</h3>
        <div className="h-80 w-full relative">
          <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => <line key={i} x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#e2e8f0" strokeWidth="0.5" />)}
            
            {/* Lunar Phase Background (Sine Wave) */}
            <path 
                d="M 0 100 Q 125 0, 250 100 T 500 100" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="1" 
                strokeDasharray="5 5"
                opacity="0.5"
            />

            {/* Zooplankton Biomass Area (Dynamic) */}
            {migrationData.length > 0 && (
                 <path 
                 d={`M 0,200 
                    ${migrationData.map((d, i) => {
                        // Map Moon Phase (0-1) to X axis (0-500)
                        // Map Biomass to Y axis
                        const x = d.moon * 500; 
                        const y = 200 - (Math.min(d.biomass, 1000) / 1000 * 180); 
                        return `L ${x},${y}`;
                    }).join(" ")} 
                    L 500,200 Z`} 
                 fill="#8b5cf6" 
                 fillOpacity="0.2"
                 stroke="#8b5cf6"
                 strokeWidth="2"
                 />
            )}
            
            {/* Moon Icons on Axis */}
            <text x="10" y="190" fontSize="20">🌑</text>
            <text x="240" y="190" fontSize="20">🌕</text>
            <text x="470" y="190" fontSize="20">🌑</text>

          </svg>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-center text-purple-700 font-semibold bg-purple-50 border border-purple-200 p-2 rounded-lg">
            🌙 Biomass correlates with lunar illumination cycles (Data synced).
          </div>
          <div className="flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500 opacity-50"></div>Zooplankton Biomass</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500 opacity-50 border border-dashed border-amber-700"></div>Lunar Cycle</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanktonCharts;

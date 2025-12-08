import React, { useState, useEffect } from 'react';

// --- Helpers for Dynamic SVG Rendering ---

// Normalizes a value to a generic 0-100 scale for plotting
const normalize = (val, min, max) => {
  if (max === min) return 50;
  return ((val - min) / (max - min)) * 100;
};

// Generates an SVG path string from an array of data points
const generateLinePath = (data, key, width, height, minVal, maxVal) => {
  if (!data || data.length === 0) return "";
  
  const stepX = width / (data.length - 1);
  
  const points = data.map((item, index) => {
    const x = index * stepX;
    // Invert Y because SVG 0 is at the top
    const y = height - (normalize(item[key], minVal, maxVal) / 100) * height; 
    return `${x} ${y}`;
  });

  return `M ${points.join(' L ')}`;
};

const KpiCard = ({ title, value, badgeText, badgeColor }) => {
  const badgeColors = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-3xl font-bold text-emerald-950">{value}</p>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeColors[badgeColor] || badgeColors.blue}`}>
          {badgeText}
        </span>
      </div>
    </div>
  );
};

const AquacultureCharts = () => {
  const [loading, setLoading] = useState(true);
  const [oceanData, setOceanData] = useState([]);
  const [radarData, setRadarData] = useState({});
  const [kpis, setKpis] = useState({
    stockHealth: { value: "--%", badge: "Loading...", color: "blue" },
    harvest: { value: "--", badge: "Analyzing", color: "blue" },
    pathogen: { value: "--", badge: "Analyzing", color: "blue" }
  });

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Environmental Data for Charts & Risk Analysis
        // Using a broad date range to get trend data
        const oceanRes = await fetch('/api/oceanographic/parameters?region=Pacific&start_date=2023-01-01');
        const oceanJson = await oceanRes.json();
        
        // 2. Fetch Abundance for Stock Health
        // Using an example species_id (e.g., 1 for Tuna/Salmon)
        const stockRes = await fetch('/api/marine-trends/abundance?region=Pacific&species_id=1');
        const stockJson = await stockRes.json();

        processData(oceanJson || [], stockJson || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch aquaculture analytics:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Data Processing Logic ---
  const processData = (oceanRaw, stockRaw) => {
    // 1. Process Oceanographic Data (Parse JSONB 'data' field)
    const processedOcean = oceanRaw.map(item => ({
      date: item.Data.eventdate,
      temp: parseFloat(item.Data.temperature || 20),
      // Simulate pathogen growth based on temp if not explicitly provided
      pathogenRisk: parseFloat(item.Data.turbidity || 0) + (parseFloat(item.Data.temperature || 0) * 0.5) 
    })).slice(-20); // Keep last 20 points for chart clarity

    setOceanData(processedOcean);

    // 2. Process Radar Data (Averages)
    if (oceanRaw.length > 0) {
      const latest = oceanRaw[oceanRaw.length - 1].Data;
      setRadarData({
        o2: normalize(parseFloat(latest.dissolved_oxygen || 5), 0, 10),
        salinity: normalize(parseFloat(latest.salinity || 30), 20, 40),
        flow: normalize(parseFloat(latest.current_speed || 0.5), 0, 2),
        bottom: 70, // Mocked as constant for this example
        predators: 20 // Mocked low risk
      });
    }

    // 3. Calculate KPIs
    // Stock Health: Based on latest abundance vs max abundance
    let stockHealthVal = 0;
    if (stockRaw.length > 0) {
      const counts = stockRaw.map(r => parseInt(r.Data.count || 0));
      const latestCount = counts[counts.length - 1];
      const maxCount = Math.max(...counts);
      stockHealthVal = Math.round((latestCount / maxCount) * 100);
    }

    // Pathogen Load: Based on latest Temp
    const latestTemp = processedOcean.length > 0 ? processedOcean[processedOcean.length - 1].temp : 0;
    const isHighRisk = latestTemp > 28;

    setKpis({
      stockHealth: { 
        value: `${stockHealthVal || 85}%`, 
        badge: stockHealthVal > 80 ? "Excellent" : "Stable", 
        color: stockHealthVal > 80 ? "green" : "yellow" 
      },
      harvest: { 
        value: "Nov 14", // In a real app, calculate based on growth curves
        badge: "On Track", 
        color: "blue" 
      },
      pathogen: { 
        value: isHighRisk ? "High Detect" : "Low Detect", 
        badge: isHighRisk ? "Warning" : "Safe", 
        color: isHighRisk ? "red" : "green" 
      }
    });
  };

  // --- Dynamic Chart Rendering ---
  
  // Calculate min/max for scaling
  const minTemp = Math.min(...oceanData.map(d => d.temp)) - 2;
  const maxTemp = Math.max(...oceanData.map(d => d.temp)) + 2;
  
  const minRisk = Math.min(...oceanData.map(d => d.pathogenRisk));
  const maxRisk = Math.max(...oceanData.map(d => d.pathogenRisk));

  return (
    <div className="space-y-6">
      {/* Row 1: KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard 
          title="Current Stock Health" 
          value={kpis.stockHealth.value} 
          badgeText={kpis.stockHealth.badge} 
          badgeColor={kpis.stockHealth.color} 
        />
        <KpiCard 
          title="Est. Harvest Date" 
          value={kpis.harvest.value} 
          badgeText={kpis.harvest.badge} 
          badgeColor={kpis.harvest.color} 
        />
        <KpiCard 
          title="Pathogen Load" 
          value={kpis.pathogen.value} 
          badgeText={kpis.pathogen.badge} 
          badgeColor={kpis.pathogen.color} 
        />
      </div>

      {/* Row 2: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Disease Risk Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-emerald-950">Infection Probability vs. Environmental Stressors</h3>
            {loading && <span className="text-xs text-slate-400">Syncing data...</span>}
          </div>
          
          <div className="h-80 w-full relative">
            {oceanData.length > 0 ? (
              <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Grid lines */}
                {[...Array(5)].map((_, i) => (
                  <line key={i} x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#e2e8f0" strokeWidth="0.5" />
                ))}
                
                {/* Dynamic Line for Water Temp (Blue) */}
                <path 
                  d={generateLinePath(oceanData, 'temp', 500, 200, minTemp, maxTemp)} 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="2" 
                />
                
                {/* Dynamic Line for Pathogen Risk (Purple) */}
                <path 
                  d={generateLinePath(oceanData, 'pathogenRisk', 500, 200, minRisk, maxRisk)} 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="2" 
                  strokeDasharray="4 2"
                />
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No environmental data available</div>
            )}
          </div>
          
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-500"></div> Water Temp (°C)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-purple-500 border-dashed border-t"></div> Calc. Pathogen Risk
            </div>
          </div>

          <div className="text-xs text-center text-amber-700 font-semibold bg-amber-50 border border-amber-200 p-2 rounded-lg mt-4">
            ⚠️ Risk increases by 15% if Temp exceeds 29°C for &gt;3 days.
          </div>
        </div>

        {/* Right: Site Suitability Radar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-emerald-950 mb-4">Location Optimization</h3>
          <div className="flex-grow flex items-center justify-center">
            {/* Dynamic Radar Chart */}
            <svg viewBox="0 0 100 100" className="w-56 h-56">
              {/* Grid */}
              {[10, 20, 30, 40].map(r => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />)}
              {/* Axes */}
              <line x1="50" y1="50" x2="50" y2="5" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="93.3" y2="25" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="93.3" y2="75" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="6.7" y2="75" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="6.7" y2="25" stroke="#cbd5e1" strokeWidth="0.5" />
              
              {/* Dynamic Data Polygon */}
              {!loading && radarData.o2 ? (
                <polygon 
                  points={`
                    50,${50 - (radarData.o2 * 0.4)} 
                    ${50 + (radarData.salinity * 0.4 * 0.866)},${50 - (radarData.salinity * 0.4 * 0.5)} 
                    ${50 + (radarData.flow * 0.4 * 0.866)},${50 + (radarData.flow * 0.4 * 0.5)} 
                    ${50 - (radarData.bottom * 0.4 * 0.866)},${50 + (radarData.bottom * 0.4 * 0.5)} 
                    ${50 - (radarData.predators * 0.4 * 0.866)},${50 - (radarData.predators * 0.4 * 0.5)}
                  `}
                  fill="#10b981" 
                  fillOpacity="0.4" 
                  stroke="#10b981"
                  strokeWidth="1"
                />
              ) : null}
              
              {/* Ideal Standard (Dashed) */}
              <polygon points="50,5 93,25 93,75 7,75 7,25" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
              
              {/* Labels */}
              <text x="42" y="2" fontSize="5" fill="#64748b">O₂</text>
              <text x="95" y="27" fontSize="5" fill="#64748b">Salinity</text>
              <text x="95" y="78" fontSize="5" fill="#64748b">Flow</text>
              <text x="-5" y="78" fontSize="5" fill="#64748b">Bottom</text>
              <text x="-10" y="27" fontSize="5" fill="#64748b">Predators</text>
            </svg>
          </div>
          <div className="flex justify-center gap-6 text-xs mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500 opacity-40"></div>Live Data</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border border-slate-500 border-dashed"></div>Ideal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AquacultureCharts;

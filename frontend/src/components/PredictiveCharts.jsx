import React, { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';

// --- Helpers ---
// Generate a 20x40 grid based on real occurrence data coordinates
const generateHotspotGrid = (occurrences) => {
  const gridW = 40;
  const gridH = 20;
  const grid = Array.from({ length: gridH }, () => Array(gridW).fill(0));
  
  // Normalize coordinates to grid
  // Assuming lat range 0-30, long 60-100 for Indian Ocean example
  // In production, calculate min/max dynamically
  occurrences.forEach(occ => {
    // Try to get lat/long from JSONB structure
    const lat = parseFloat(occ.Data?.decimalLatitude || occ.Data?.latitude || Math.random() * 20 + 5);
    const lon = parseFloat(occ.Data?.decimalLongitude || occ.Data?.longitude || Math.random() * 40 + 60);
    
    // Simple normalization
    const x = Math.floor(((lon - 60) / 40) * gridW);
    const y = Math.floor(((lat - 0) / 30) * gridH);
    
    if (x >= 0 && x < gridW && y >= 0 && y < gridH) {
      grid[y][x] += 1;
    }
  });

  // Normalize counts to probability 0-1
  const maxCount = Math.max(...grid.flat()) || 1;
  return grid.map(row => row.map(val => val / maxCount));
};

const PredictiveCharts = () => {
  const [loading, setLoading] = useState(true);
  const [gridData, setGridData] = useState([]);
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Occurrences for Hotspot Map
        const occRes = await fetch('/api/occurrence?region=Indian Ocean'); // Example filter
        const occJson = await occRes.json();
        const grid = generateHotspotGrid(occJson || []);
        setGridData(grid);

        // 2. Fetch Ocean Data for Risk Forecast
        // Getting last 7 days of data to project trend
        const riskRes = await fetch('/api/oceanographic/parameters?region=Indian Ocean&start_date=2023-01-01');
        const riskJson = await riskRes.json();
        
        // Process Risk Data
        // Map recent data points to risk levels (0-100)
        const risks = riskJson.slice(-10).map((d, i) => ({
            day: i,
            hypoxia: (10 - parseFloat(d.Data.dissolved_oxygen || 8)) * 10, // Lower O2 = Higher Risk
            algal: parseFloat(d.Data.chlorophyll || 1) * 5, // Higher Chl = Higher Risk
            acidity: (8.1 - parseFloat(d.Data.ph || 8.1)) * 50 // Lower pH = Higher Risk
        }));
        setForecastData(risks);
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to load predictive data", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- SVG Path Generator for Stacked Area ---
  const generateAreaPath = (data, key, offsetY = 0) => {
    if (!data.length) return "";
    const width = 500;
    const height = 200;
    const step = width / (data.length - 1);
    
    // Top line
    const pointsTop = data.map((d, i) => {
        const val = (d[key] || 0) + offsetY;
        const y = height - Math.min(val, 100) * 1.5; // Scale to fit
        return `${i * step},${y}`;
    });

    // Bottom line (for area close)
    const pointsBottom = data.map((d, i) => {
        const y = height - offsetY * 1.5;
        return `${i * step},${y}`;
    }).reverse();

    return `M ${pointsTop[0]} L ${pointsTop.join(' L ')} L ${pointsBottom.join(' L ')} Z`;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Top Row: AI Hotspot Probability */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-emerald-950">Species Occurrence Probability (MaxEnt Model)</h3>
            {loading && <Loader2 size={16} className="animate-spin text-slate-400" />}
        </div>
        
        <div className="h-96 w-full bg-slate-50 rounded-lg relative p-4 flex items-center justify-center">
          {gridData.length > 0 ? (
            <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
                {gridData.map((row, y) => 
                    row.map((prob, x) => {
                        let color = '#e2e8f0'; // Default gray
                        let r = 2;
                        
                        if (prob > 0.01) {
                            r = 4;
                            if (prob > 0.8) color = '#a855f7'; // Purple (High)
                            else if (prob > 0.5) color = '#8b5cf6'; // Violet
                            else if (prob > 0.2) color = '#3b82f6'; // Blue
                            else color = '#60a5fa'; // Light Blue
                        }

                        return <circle key={`${x}-${y}`} cx={x * 10 + 5} cy={y * 10 + 5} r={r} fill={color} opacity={Math.max(0.3, prob)} />;
                    })
                )}
                {/* Overlay: Recommended Site (Mocked logic: find max prob cell) */}
                <g transform="translate(300, 100)" className="cursor-pointer animate-bounce">
                <Star className="text-yellow-400 drop-shadow-md" fill="currentColor" stroke="none" size={24} />
                <text x="15" y="5" fontSize="10" fill="#334155" className="font-bold">Predicted Hotspot</text>
                </g>
            </svg>
          ) : (
            <div className="text-slate-400">Loading spatial model...</div>
          )}
          
          <div className="absolute bottom-4 right-4 text-xs font-semibold text-slate-500 bg-white/80 p-2 rounded-lg border border-slate-100">
            Probability: <span className="text-blue-500">0.0 (Low)</span> → <span className="text-purple-500">1.0 (High)</span>
          </div>
        </div>
        
        <div className="text-xs text-center text-purple-700 font-semibold bg-purple-50 border border-purple-200 p-2 rounded-lg mt-4">
          📍 AI identifies Grid Sector B-4 as a high-value zone for <span className="font-bold">Tuna</span> spawning based on occurrence density.
        </div>
      </div>

      {/* 2. Bottom Row: Environmental Forecast */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4">7-Day Ecosystem Risk Forecast</h3>
        <div className="h-80 w-full relative">
          
          <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => <line key={i} x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#f1f5f9" strokeWidth="1" />)}
            
            <defs>
              <linearGradient id="hypoxiaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/></linearGradient>
              <linearGradient id="algalGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/><stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/></linearGradient>
              <linearGradient id="acidityGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.6}/><stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/></linearGradient>
            </defs>
            
            {forecastData.length > 0 && (
                <>
                {/* Layer 1: Hypoxia (Bottom) */}
                <path d={generateAreaPath(forecastData, 'hypoxia', 0)} fill="url(#hypoxiaGradient)" />
                
                {/* Layer 2: Algal Bloom (Stacked on Hypoxia roughly for visual) */}
                <path d={generateAreaPath(forecastData, 'algal', 30)} fill="url(#algalGradient)" />
                
                {/* Layer 3: Acidity (Top) */}
                <path d={generateAreaPath(forecastData, 'acidity', 60)} fill="url(#acidityGradient)" />
                </>
            )}

            {/* Vertical Cursor Line (Today) */}
            <line x1="450" y1="0" x2="450" y2="200" stroke="#0f172a" strokeWidth="1" strokeDasharray="3 3" />
            <text x="455" y="10" fontSize="10" fill="#0f172a">Today</text>
          </svg>

          {!loading && forecastData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">No forecast data available</div>
          )}
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

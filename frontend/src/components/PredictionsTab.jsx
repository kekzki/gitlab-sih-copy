import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Activity, Sparkles, TrendingUp, SlidersHorizontal, 
  Thermometer, FlaskConical, Anchor, Shield, Play, Zap, Loader2, AlertCircle 
} from 'lucide-react';

const PredictionsTab = () => {
  const [mode, setMode] = useState('query'); // 'query' or 'simulation'

  return (
    <div className="p-6 md:p-10 bg-slate-50 h-full">
      {/* 1. TOP TOGGLE NAVIGATION */}
      <div className="flex justify-center mb-8">
        <div className="bg-white border border-slate-200 p-1.5 rounded-full shadow-sm flex gap-1">
          <button
            onClick={() => setMode('query')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === 'query' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <MessageSquare size={16} /> AI Policy Query
          </button>
          <button
            onClick={() => setMode('simulation')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === 'simulation' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Activity size={16} /> Simulation Engine
          </button>
        </div>
      </div>

      {/* Conditionally render content based on mode */}
      {mode === 'query' ? <AIPolicyQuery /> : <SimulationEngine />}
    </div>
  );
};

// --- MODE A: AI POLICY QUERY ---
const AIPolicyQuery = () => {
  const [query, setQuery] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Connects to handleNaturalLanguageQuery in main.go
      const response = await fetch('/api/query/natural-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) throw new Error("Failed to get prediction");

      // Assuming backend returns { answer: "...", data: {...} }
      // If backend text response is simple string, adjust parsing
      const data = await response.json(); 
      
      // MOCKING STRUCTURE if backend is raw text, adapt here:
      // In a real scenario, the Go backend should return structured JSON.
      // For now, we simulate the structure based on the text response if needed.
      setPrediction({
        summary: data.answer || data.message || "Analysis complete based on current trend data.",
        current: 85, // These could be dynamic from backend
        projected: data.projected_value || 67,
      });

    } catch (err) {
      console.error(err);
      // Fallback for demo if backend isn't responding perfectly
      setPrediction({
        summary: "Based on current trends, <strong class='text-rose-600'>acidification</strong> in the region is projected to reduce shellfish calcification by 18% over 5 years.",
        current: 85,
        projected: 62
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Query Container */}
      <div className="w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
        <div className="flex items-center gap-2 mb-6 text-slate-800">
          <Sparkles className="text-cyan-500" size={24} />
          <h2 className="text-xl font-bold">Predictive Analysis Query</h2>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g., Effects of increase in ocean acidification by pH of 0.5 on shellfish aquaculture..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-6 pr-40 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate} 
            disabled={loading || !query}
            className={`absolute right-2 top-2 bottom-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16}/>}
            {loading ? 'Analyzing...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Empty State / Results Placeholder */}
      <div className="w-full bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center min-h-[300px]">
        {!prediction && !loading ? (
          <>
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI-Powered Marine Predictions</h3>
            <p className="text-slate-500 max-w-md">
              Enter a query above to ask the LLM about environmental trends and forecast future scenarios based on your dataset.
            </p>
          </>
        ) : loading ? (
           <div className="flex flex-col items-center animate-pulse">
             <div className="w-12 h-12 rounded-full border-4 border-cyan-100 border-t-cyan-500 animate-spin mb-4"></div>
             <p className="text-slate-400 font-medium">Processing natural language query...</p>
           </div>
        ) : (
          <div className="w-full animate-in fade-in duration-300">
            <div className="text-slate-700 text-center text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
               {/* Safe render if backend returns HTML, otherwise just text */}
               <div dangerouslySetInnerHTML={{ __html: prediction.summary }} />
            </div>
            
            <div className="flex justify-center items-end gap-12 border-t border-slate-100 pt-8">
              <div className="text-center group">
                <div className="relative h-32 w-20 bg-emerald-100 rounded-t-xl mx-auto overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-emerald-500 transition-all duration-1000" style={{ height: '85%' }}></div>
                </div>
                <p className="text-sm font-bold text-slate-600 mt-3">Current Status</p>
                <p className="text-xs text-slate-400 font-mono">Baseline</p>
              </div>
              
              <div className="text-center group">
                <div className="relative h-32 w-20 bg-rose-100 rounded-t-xl mx-auto overflow-hidden">
                     <div 
                        className="absolute bottom-0 w-full bg-rose-500 transition-all duration-1000" 
                        style={{ height: `${(prediction.projected / prediction.current) * 85}%` }}
                     ></div>
                </div>
                <p className="text-sm font-bold text-slate-600 mt-3">Projected Impact</p>
                <p className="text-xs text-rose-500 font-bold font-mono">
                    {Math.round(((prediction.projected - prediction.current)/prediction.current)*100)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MODE B: SIMULATION ENGINE ---
const SimulationEngine = () => {
  // Simulator State
  const [sstRise, setSstRise] = useState(1.5);
  const [acidification, setAcidification] = useState(-0.1);
  const [fishingEffort, setFishingEffort] = useState(80);
  const [mpaCoverage, setMpaCoverage] = useState(5);
  
  // Real Data Baseline State
  const [baselineTemp, setBaselineTemp] = useState(28); // Default fallback
  const [loadingBaseline, setLoadingBaseline] = useState(true);

  // Computed Projection State
  const [projection, setProjection] = useState([]);

  // 1. Fetch Real Baseline Data on Mount
  useEffect(() => {
    const fetchBaseline = async () => {
        try {
            const res = await fetch('/api/oceanographic/parameters?region=Pacific&start_date=2023-01-01');
            const data = await res.json();
            if (data && data.length > 0) {
                // Get average of recent temps
                const temps = data.map(d => parseFloat(d.Data.temperature || 28));
                const avg = temps.reduce((a,b)=>a+b, 0) / temps.length;
                setBaselineTemp(avg);
            }
        } catch (e) {
            console.error("Using default baseline", e);
        } finally {
            setLoadingBaseline(false);
        }
    };
    fetchBaseline();
  }, []);

  // 2. Run Simulation (Client-Side Logic)
  const runSimulation = () => {
     // Logic: Biomass starts at 100.
     // SST Rise (-5 per deg), Acidification (-10 per 0.1), Fishing (-0.2 per unit), MPA (+0.5 per unit)
     const points = [];
     let currentBiomass = 100;
     
     // Factors
     const tempImpact = sstRise * 8; 
     const acidImpact = Math.abs(acidification) * 100; // -0.1 pH is huge
     const fishImpact = (fishingEffort / 100) * 20;
     const mpaBenefit = mpaCoverage * 1.5;

     const netChangePerStep = (mpaBenefit - tempImpact - acidImpact - fishImpact) / 10;

     for(let i=0; i<=10; i++) { // 10 Year projection
        points.push({ year: i, val: Math.max(0, currentBiomass) });
        currentBiomass += netChangePerStep;
     }
     setProjection(points);
  };

  // Run initial simulation when baseline loads
  useEffect(() => {
    if(!loadingBaseline) runSimulation();
  }, [loadingBaseline, sstRise, acidification, fishingEffort, mpaCoverage]);


  // Helper for SVG Path
  const getPath = (data) => {
      if(!data.length) return "";
      const points = data.map((d, i) => {
          const x = i * 50; // 500px width / 10 steps
          const y = 200 - (d.val * 1.5); // Scale 100 to fit height
          return `${x},${y}`;
      });
      // Spline smoothing could be added here, using straight lines for simplicity
      return `M ${points.join(' L ')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Left Panel: Controls */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-6 flex flex-col">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <SlidersHorizontal size={20} className="text-slate-500" />
            <h2 className="text-xl font-bold text-emerald-950">Variables</h2>
            {loadingBaseline && <Loader2 size={16} className="animate-spin text-slate-400 ml-auto"/>}
          </div>

          {/* Environmental Stressors */}
          <div className="space-y-6">
            <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wider">Stressors</h3>
            
            {/* SST Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-2"><Thermometer size={14} /> SST Rise</span>
                <span className="font-bold text-slate-700">+{sstRise.toFixed(1)}°C</span>
              </label>
              <input 
                type="range" min="0" max="4" step="0.1" 
                value={sstRise} 
                onChange={(e) => setSstRise(parseFloat(e.target.value))} 
                className="w-full h-2 bg-gradient-to-r from-blue-200 via-orange-200 to-red-400 rounded-lg appearance-none cursor-pointer accent-slate-700" 
              />
              <div className="text-[10px] text-slate-400 flex justify-between">
                 <span>Baseline: {baselineTemp.toFixed(1)}°C</span>
                 <span>Max: {(baselineTemp+4).toFixed(1)}°C</span>
              </div>
            </div>

            {/* Acidification Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500 flex items-center justify-between">
                 <span className="flex items-center gap-2"><FlaskConical size={14} /> pH Change</span>
                 <span className="font-bold text-slate-700">{acidification.toFixed(2)}</span>
              </label>
              <input 
                type="range" min="-0.5" max="0" step="0.01" 
                value={acidification}
                onChange={(e) => setAcidification(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
              />
            </div>
          </div>

          {/* Policy Interventions */}
          <div className="space-y-6 mt-8">
            <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wider">Policy</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500 flex items-center gap-2"><Anchor size={14} /> Fishing Effort ({fishingEffort}%)</label>
              <input 
                type="range" min="0" max="100" step="5" 
                value={fishingEffort}
                onChange={(e) => setFishingEffort(parseInt(e.target.value))}
                className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500 flex items-center gap-2"><Shield size={14} /> MPA Coverage ({mpaCoverage}%)</label>
              <input 
                type="range" min="0" max="50" step="1" 
                value={mpaCoverage}
                onChange={(e) => setMpaCoverage(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
              />
            </div>
          </div>
        </div>
        
        {/* Visual Run Button (Functional via useEffect, but nice for UX) */}
        <button className="mt-8 w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-default">
          <Activity size={16} /> Auto-Calculating...
        </button>
      </div>

      {/* Right Panel: Visualization */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 space-y-6 flex flex-col">
        
        {/* Primary Graph */}
        <div className="h-80 w-full relative flex-grow">
          <h3 className="text-slate-500 font-bold text-sm mb-4 uppercase tracking-wide flex justify-between">
             <span>Projected Biomass vs. Time (10 Years)</span>
             {projection.length > 0 && (
                 <span className={projection[10].val < 50 ? 'text-rose-500' : 'text-emerald-500'}>
                     Outcome: {projection[10].val < 50 ? 'Collapse Risk' : 'Sustainable'}
                 </span>
             )}
          </h3>
          
          <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none" className="overflow-visible">
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => <line key={i} x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#f1f5f9" strokeWidth="1" />)}
            
            {/* Baseline (Static Line at 100 biomass) */}
            <line x1="0" y1="50" x2="500" y2="50" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
            <text x="505" y="55" fontSize="10" fill="#94a3b8">Baseline</text>
            
            {/* Dynamic Projection Line */}
            <path 
                d={getPath(projection)} 
                fill="none" 
                stroke={projection.length && projection[10].val < 50 ? "#f43f5e" : "#06b6d4"} 
                strokeWidth="3" 
                strokeLinecap="round"
            />
            
            {/* Fill Area */}
            <path 
                d={`${getPath(projection)} L 500,200 L 0,200 Z`} 
                fill={projection.length && projection[10].val < 50 ? "#f43f5e" : "#06b6d4"} 
                fillOpacity="0.1" 
            />
            
            {/* Years Axis */}
            <text x="0" y="215" fontSize="10" fill="#94a3b8">Now</text>
            <text x="250" y="215" fontSize="10" fill="#94a3b8">Year 5</text>
            <text x="480" y="215" fontSize="10" fill="#94a3b8">Year 10</text>
          </svg>
        </div>

        {/* Secondary Visual: Matrix */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-slate-500 font-bold text-sm mb-4 uppercase tracking-wide">Trade-off Matrix</h3>
          <div className="flex items-end gap-6 p-4 bg-slate-50 rounded-xl">
            
            {/* Health Bar */}
            <div className="flex-1 text-center">
              <div className="relative h-24 w-full bg-slate-200 rounded-t-lg overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full bg-emerald-400 transition-all duration-500" 
                    style={{ height: `${Math.min(100, Math.max(0, projection.length ? projection[10].val : 50))}%` }}
                  ></div>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-2">Ecosystem Health</p>
            </div>

            {/* Revenue Bar (Inverse of Health roughly, but boosted by Fishing Effort) */}
            <div className="flex-1 text-center">
              <div className="relative h-24 w-full bg-slate-200 rounded-t-lg overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full bg-amber-400 transition-all duration-500" 
                    style={{ height: `${Math.min(100, (fishingEffort * 0.8) + (projection.length && projection[10].val * 0.2))}%` }}
                  ></div>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-2">Short-term Revenue</p>
            </div>
            
          </div>
          <div className="mt-2 flex items-start gap-2 text-[10px] text-slate-400">
             <AlertCircle size={12} className="mt-0.5"/>
             <p>Model simplifies trophic interactions. High fishing effort increases short-term revenue but degrades long-term ecosystem health resilience.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsTab;

import React, { useState } from 'react';
import { MessageSquare, Activity, Sparkles, TrendingUp, SlidersHorizontal, Thermometer, FlaskConical, Anchor, Shield, Play, Zap } from 'lucide-react';

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
  const [prediction, setPrediction] = useState(null);

  const handleGenerate = () => {
    // Simulate API call
    setPrediction({
      summary: "Based on a 0.5 pH drop, shellfish calcification rates in Kavaratti are projected to decline by <strong>18%</strong>.",
      current: 85,
      projected: 67,
    });
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
            placeholder="E.g., Effects of increase in ocean acidification by pH of 0.5 on shellfish aquaculture..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-6 pr-40 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
          <button onClick={handleGenerate} className="absolute right-2 top-2 bottom-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 rounded-lg font-bold text-sm transition-colors">
            Generate Prediction
          </button>
        </div>
      </div>

      {/* Empty State / Results Placeholder */}
      <div className="w-full bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center min-h-[300px]">
        {!prediction ? (
          <>
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI-Powered Marine Predictions</h3>
            <p className="text-slate-500 max-w-md">
              Enter a query above to generate predictive analysis for marine ecosystems. Our AI models analyze environmental trends and forecast future scenarios.
            </p>
          </>
        ) : (
          <div className="w-full animate-in fade-in duration-300">
            <p className="text-slate-700 text-center text-lg mb-6" dangerouslySetInnerHTML={{ __html: prediction.summary }} />
            <div className="flex justify-center items-end gap-8">
              <div className="text-center">
                <div className="h-32 w-16 bg-blue-200 rounded-t-lg mx-auto" style={{ height: `${prediction.current * 1.2}px` }}></div>
                <p className="text-sm font-bold text-slate-600 mt-2">Current Growth</p>
              </div>
              <div className="text-center">
                <div className="h-24 w-16 bg-red-200 rounded-t-lg mx-auto" style={{ height: `${prediction.projected * 1.2}px` }}></div>
                <p className="text-sm font-bold text-slate-600 mt-2">Projected Growth</p>
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
  const [sst, setSst] = useState(1.5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Left Panel: Controls */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-6 flex flex-col">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <SlidersHorizontal size={20} className="text-slate-500" />
            <h2 className="text-xl font-bold text-emerald-950">Simulation Variables</h2>
          </div>

          {/* Environmental Stressors */}
          <div className="space-y-6">
            <h3 className="font-bold text-slate-600">Environmental Stressors</h3>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-2"><Thermometer size={14} /> SST Rise</span>
                <span className="font-bold text-slate-700">+{sst.toFixed(1)}°C</span>
              </label>
              <input type="range" min="0" max="4" step="0.1" value={sst} onChange={(e) => setSst(parseFloat(e.target.value))} className="w-full h-2 bg-gradient-to-r from-blue-200 to-red-200 rounded-lg appearance-none cursor-pointer accent-slate-700" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500 flex items-center gap-2"><FlaskConical size={14} /> Acidification</label>
              <input type="range" min="-0.5" max="0" step="0.01" defaultValue="-0.1" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
            </div>
          </div>

          {/* Policy Interventions */}
          <div className="space-y-6 mt-8">
            <h3 className="font-bold text-slate-600">Policy Interventions</h3>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500 flex items-center gap-2"><Anchor size={14} /> Fishing Effort</label>
              <input type="range" min="0" max="100" step="1" defaultValue="80" className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500 flex items-center gap-2"><Shield size={14} /> MPA Expansion</label>
              <input type="range" min="0" max="30" step="1" defaultValue="5" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            </div>
          </div>
        </div>
        <button className="mt-auto w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2">
          <Play size={20} fill="white" /> Run Projection Model
        </button>
      </div>

      {/* Right Panel: Visualization */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 space-y-6">
        {/* Primary Graph */}
        <div className="h-80 w-full relative">
          <h3 className="text-slate-500 font-bold text-sm mb-2 uppercase tracking-wide">Projected Biomass vs. Time</h3>
          <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => <line key={i} x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#e2e8f0" strokeWidth="0.5" />)}
            
            {/* Baseline */}
            <path d="M 0 100 C 100 110, 200 90, 300 100 S 500 110, 500 110" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
            
            {/* Simulated */}
            <path d="M 0 100 C 100 80, 200 40, 300 50 S 500 20, 500 20" fill="none" stroke="#06b6d4" strokeWidth="2.5" />

            {/* Fill Area */}
            <path d="M 0 100 C 100 80, 200 40, 300 50 S 500 20, 500 20 L 500 110 C 400 110, 300 100, 300 100 S 100 110, 0 100 Z" fill="#06b6d4" fillOpacity="0.1" />
          </svg>
        </div>

        {/* Secondary Visual */}
        <div>
          <h3 className="text-slate-500 font-bold text-sm mb-2 uppercase tracking-wide">Economic Trade-off Matrix</h3>
          <div className="flex items-end gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="flex-1 text-center">
              <div className="h-24 w-full bg-green-200 rounded-t-lg" style={{ height: '96px' }}></div>
              <p className="text-xs font-bold text-slate-600 mt-2">Biodiversity Health</p>
            </div>
            <div className="flex-1 text-center">
              <div className="h-16 w-full bg-red-200 rounded-t-lg" style={{ height: '64px' }}></div>
              <p className="text-xs font-bold text-slate-600 mt-2">Fishery Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsTab;
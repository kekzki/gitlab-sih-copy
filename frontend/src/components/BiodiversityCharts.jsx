import React, { useState } from 'react';
import { 
  ComposedChart, AreaChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Fish, Search } from 'lucide-react';

const DIVERSITY_METRICS = [
  'Species Richness (S)', 
  'Shannon Index (H\')', 
  'Simpson Index (D)', 
  'Evenness (E)', 
  'Rarefaction Curves', 
  'Presence/Absence', 
  'Functional Diversity', 
  'Taxonomic Diversity'
];

// Mock Data
const METRIC_DATA = [
  { year: 2020, value: 45 }, { year: 2021, value: 52 },
  { year: 2022, value: 49 }, { year: 2023, value: 60 }, { year: 2024, value: 65 }
];

const SPECIES_ABUNDANCE = [
  { month: 'Jan', count: 200 }, { month: 'Feb', count: 350 },
  { month: 'Mar', count: 300 }, { month: 'Apr', count: 450 },
  { month: 'May', count: 600 }, { month: 'Jun', count: 800 }
];

const BiodiversityCharts = ({ filters }) => {
  const [activeMetric, setActiveMetric] = useState('Species Richness (S)');
  const [selectedSpecies, setSelectedSpecies] = useState('Thunnus albacares');

  return (
    <div className="space-y-8">
      
      {/* 1. BIODIVERSITY TIME-SERIES */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Biodiversity Time-Series</h3>
            <p className="text-xs text-slate-500">Tracking: {activeMetric}</p>
          </div>
          
          {/* Custom Pill Selector for Metrics */}
          <div className="flex flex-wrap gap-2 max-w-2xl justify-end">
            {DIVERSITY_METRICS.map(metric => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border
                  ${activeMetric === metric 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'}`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={METRIC_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{r: 5}} name={activeMetric} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. MARINE TRENDS (Species Filter + Abundance) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Marine Trends: Species Abundance</h3>
            <p className="text-xs text-slate-500">Spatial abundance & year for selected species</p>
          </div>

          {/* SEARCHABLE DROPDOWN */}
          <div className="relative w-full md:w-80">
            <div className="flex items-center gap-3 bg-slate-50 p-2 pl-4 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-cyan-100 transition-all">
              <Fish size={18} className="text-cyan-600" />
              <input 
                type="text" 
                list="species-list" 
                placeholder="Search Species (Type to filter)..." 
                className="bg-transparent text-sm font-semibold text-slate-700 w-full focus:outline-none"
                onChange={(e) => setSelectedSpecies(e.target.value)}
                defaultValue={selectedSpecies}
              />
              <Search size={16} className="text-slate-400 mr-2" />
            </div>
            {/* Native Datalist for Search + Select */}
            <datalist id="species-list">
              <option value="Thunnus albacares (Yellowfin Tuna)" />
              <option value="Sardinella longiceps (Indian Oil Sardine)" />
              <option value="Rastrelliger kanagurta (Indian Mackerel)" />
              <option value="Penaeus monodon (Tiger Prawn)" />
              <option value="Katsuwonus pelamis (Skipjack Tuna)" />
            </datalist>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SPECIES_ABUNDANCE}>
              <defs>
                <linearGradient id="colorAbundance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#06b6d4" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorAbundance)" 
                name="Abundance" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default BiodiversityCharts;
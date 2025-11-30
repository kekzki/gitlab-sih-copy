import React, { useState } from 'react';
import { Activity, Leaf, Fish, Thermometer, Droplets, BrainCircuit, MapPin, Calendar, Filter } from 'lucide-react';

// Child Components
import EnvHealthCharts from '../components/EnvHealthCharts';
import BiodiversityCharts from '../components/BiodiversityCharts';
// (Keep other imports if you have code for them, otherwise comment out)

const TABS = [
  { id: 'env', label: 'Environmental Health', icon: <Activity size={16} /> },
  { id: 'bio', label: 'Biodiversity & Ecosystem', icon: <Leaf size={16} /> },
  // Add others back if needed later
];

const Visualisation = () => {
  const [activeTab, setActiveTab] = useState('env');
  
  // 1. GLOBAL FILTERS (As requested)
  const [filters, setFilters] = useState({
    location: 'Bay of Bengal',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* HEADER */}
        <header className="bg-emerald-950 rounded-3xl p-8 text-center relative overflow-hidden shadow-xl mb-8">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Visualization Studio</h1>
            <p className="mt-2 text-slate-300 font-medium">Interactive multi-parameter oceanographic analysis</p>
          </div>
        </header>

        {/* GLOBAL FILTER BAR */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-xs tracking-wider">
            <Filter size={14} /> Global Filters
          </div>
          
          {/* Location Filter */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <MapPin size={18} className="text-blue-600" />
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Region</label>
              <select 
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="bg-transparent font-bold text-slate-700 text-sm focus:outline-none cursor-pointer min-w-[150px]"
              >
                {/* "Display all regions in db" */}
                <option>Bay of Bengal</option>
                <option>Arabian Sea</option>
                <option>Indian Ocean (South)</option>
                <option>Lakshadweep Sea</option>
                <option>Andaman Sea</option>
                <option>Gulf of Mannar</option>
                <option>Kochi Coast</option>
              </select>
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Calendar size={18} className="text-emerald-600" />
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Time Range</label>
              <div className="flex gap-2 items-center">
                <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="bg-transparent font-semibold text-slate-700 text-sm focus:outline-none" />
                <span className="text-slate-400">-</span>
                <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="bg-transparent font-semibold text-slate-700 text-sm focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-center mb-8">
          <div className="bg-white border border-slate-200 p-1.5 rounded-full shadow-md flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all
                  ${activeTab === tab.id ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT RENDER */}
        <main className="min-h-[500px]">
          {activeTab === 'env' && <EnvHealthCharts filters={filters} />}
          {activeTab === 'bio' && <BiodiversityCharts filters={filters} />}
        </main>
      </div>
    </div>
  );
};

export default Visualisation;
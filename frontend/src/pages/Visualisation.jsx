import React, { useState } from 'react';
import { Activity, Leaf, Fish, Thermometer, Droplets, BrainCircuit } from 'lucide-react';

// Import the newly created chart components
import EnvHealthCharts from '../components/EnvHealthCharts';
import BiodiversityCharts from '../components/BiodiversityCharts';
import AquacultureCharts from '../components/AquacultureCharts';
import ClimateCharts from '../components/ClimateCharts';
import PlanktonCharts from '../components/PlanktonCharts';
import PredictiveCharts from '../components/PredictiveCharts';

const TABS = [
  { id: 'env', label: 'Environmental Health', icon: <Activity size={16} />, component: <EnvHealthCharts /> },
  { id: 'bio', label: 'Biodiversity & Ecosystem', icon: <Leaf size={16} />, component: <BiodiversityCharts /> },
  { id: 'aqua', label: 'Aquaculture', icon: <Fish size={16} />, component: <AquacultureCharts /> },
  { id: 'climate', label: 'Climate Oceanography', icon: <Thermometer size={16} />, component: <ClimateCharts /> },
  { id: 'plankton', label: 'Plankton Analytics', icon: <Droplets size={16} />, component: <PlanktonCharts /> },
  { id: 'predictive', label: 'Predictive AI Charts', icon: <BrainCircuit size={16} />, component: <PredictiveCharts /> },
];

const Visualisation = () => {
  const [activeTab, setActiveTab] = useState('env');

  const renderContent = () => {
    const active = TABS.find(tab => tab.id === activeTab);
    return active ? active.component : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 1. HEADER SECTION */}
        <header className="bg-emerald-950 rounded-3xl p-8 text-center relative overflow-hidden">
          {/* Subtle background pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          ></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Visualization Studio
            </h1>
            <p className="mt-2 text-slate-300 font-medium">
              Interactive multi-parameter oceanographic analysis
            </p>
          </div>
        </header>

        {/* 2. "FLIP THING" NAVIGATION */}
        <div className="flex justify-center mt-8 mb-8">
          <div className="bg-white border border-slate-200 p-1.5 rounded-full shadow-md shadow-slate-200/50 flex overflow-x-auto gap-1 hide-scrollbar">
            {TABS.map(tab => (
              <TabButton
                key={tab.id}
                id={tab.id}
                label={tab.label}
                icon={tab.icon}
                active={activeTab}
                onClick={setActiveTab}
              />
            ))}
          </div>
        </div>

        {/* 3. DYNAMIC CONTENT AREA */}
        <main className="min-h-[500px]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Helper Component for the Pill Tabs
const TabButton = ({ id, label, icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
      ${active === id 
        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
  >
    {icon}
    <span className="whitespace-nowrap">{label}</span>
  </button>
);

export default Visualisation;

import React, { useState } from 'react';
import { 
  Download, 
  Map as MapIcon, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb 
} from 'lucide-react';
import EcosystemTab from '../components/EcosystemTab';
import UploadedDataTab from '../components/UploadedDataTab';
import WarningsTab from '../components/WarningsTab';
import PredictionsTab from '../components/PredictionsTab';
import SuggestionsTab from '../components/SuggestionsTab';

const TABS = [
  { id: 'ecosystem', label: 'Ecosystem Health', icon: <MapIcon size={16} />, component: <EcosystemTab /> },
  { id: 'data', label: 'Uploaded Data', icon: <FileText size={16} />, component: <UploadedDataTab /> },
  { id: 'predictions', label: 'Predictions', icon: <TrendingUp size={16} />, component: <PredictionsTab /> },
  { id: 'warnings', label: 'Warnings', icon: <AlertTriangle size={16} />, component: <WarningsTab /> },
  { id: 'suggestions', label: 'Suggestions', icon: <Lightbulb size={16} />, component: <SuggestionsTab /> },
];

const Analysis = () => {
  const [activeTab, setActiveTab] = useState('ecosystem');

  const renderContent = () => {
    const active = TABS.find(tab => tab.id === activeTab);
    // Fallback to the first tab if the active tab is not found
    return active ? active.component : TABS[0].component;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-100">
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* 1. HEADER SECTION (The Control Island) */}
        <header className="bg-emerald-950 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-emerald-900/10 relative overflow-hidden">
          
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
              Marine Analysis Dashboard
            </h1>
            <p className="text-slate-300 font-medium">
              Comprehensive ecosystem health monitoring and predictive analytics
            </p>
          </div>

          <div className="relative z-10 mt-6 md:mt-0">
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white hover:text-emerald-950 text-white border border-white/20 px-6 py-3 rounded-xl font-semibold transition-all duration-300 group">
              <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
              Download Report
            </button>
          </div>
        </header>
        <br />
        <br />
        {/* 2. TAB NAVIGATION (The Pill Dock) */}
        <div className="flex justify-center -mt-6 relative z-20 mb-8">
          <div className="bg-white border border-slate-200 p-1.5 rounded-full shadow-lg shadow-slate-200/50 flex flex-wrap justify-center gap-1">
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

        {/* 3. CONTENT AREA (The Canvas) */}
        <main className="bg-white rounded-3xl min-h-[600px] border border-slate-100 shadow-sm p-1">
          {/* Inner container for padding flexibility */}
          <div className="w-full h-full rounded-[20px] overflow-hidden">
            {renderContent()}
          </div>
        </main>

      </div>
    </div>
  );
};

// Helper Component for the Pill Tabs
const TabButton = ({ id, label, icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
      ${active === id 
        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25 ring-2 ring-white ring-offset-2 ring-offset-slate-100' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
  >
    {icon}
    {label}
  </button>
);

export default Analysis;
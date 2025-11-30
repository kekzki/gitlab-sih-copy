import React, { useState } from 'react';
import { FolderOpen, Table, Image as ImageIcon, FileText, Dna, Activity, Droplets, Clock, Ruler } from 'lucide-react';
import OtolithAnalysisView from './OtolithAnalysisView';
import EdnaAnalysisView from './EdnaAnalysisView';

const UploadedDataTab = () => {
  const [selectedFile, setSelectedFile] = useState(0);

  return (
    <div className="flex h-[700px] bg-white rounded-3xl overflow-hidden border border-slate-700/50">
      
      {/* 1. LEFT SIDEBAR: File List */}
      <div className="w-1/4 bg-slate-50 border-r border-slate-200 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <FolderOpen size={20} /> Project Files
          </div>
          <button className="text-xs bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg font-medium text-slate-700">
            Upload
          </button>
        </div>
        
        <div className="space-y-2">
          <FileItem idx={0} name="Coastal_Salinity.csv" type="csv" selected={selectedFile} onClick={setSelectedFile} />
          <FileItem idx={1} name="Otolith_Scan_004.jpg" type="img" selected={selectedFile} onClick={setSelectedFile} />
          <FileItem idx={2} name="Marine_Policy.pdf" type="pdf" selected={selectedFile} onClick={setSelectedFile} />
          <FileItem idx={3} name="Sequence_12S.fasta" type="dna" selected={selectedFile} onClick={setSelectedFile} />
        </div>
      </div>

      {/* 2. RIGHT CANVAS: Dynamic View */}
      <div className="w-3/4 p-8 bg-white text-slate-900 overflow-y-auto">
        
        {/* VIEW A: CSV Analysis */}
        {selectedFile === 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Statistical Correlation Analysis</h2>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Processed</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <StatCard icon={<Activity />} label="Mean Temp" value="28.1°C" />
              <StatCard icon={<Droplets />} label="Median Salinity" value="34 PSU" />
              <StatCard icon={<Activity />} label="Std Dev" value="1.2" />
              <StatCard icon={<Table />} label="Rows" value="15,400" />
            </div>

            <div className="h-80 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
               {/* Mock Heatmap Visual */}
               <div className="grid grid-cols-5 gap-1 p-4">
                  {[...Array(25)].map((_, i) => (
                    <div key={i} className={`w-12 h-12 rounded-md opacity-80`} 
                         style={{backgroundColor: `rgba(6, 182, 212, ${Math.random()})`}}></div>
                  ))}
               </div>
               <p className="absolute bottom-4 text-slate-400 text-sm font-mono">Inter-parameter Correlation Matrix (XGBoost)</p>
            </div>
          </div>
        )}

        {/* VIEW B: Otolith Analysis */}
        {selectedFile === 1 && (
          <OtolithAnalysisView />
        )}

        {/* VIEW C: eDNA Analysis */}
        {selectedFile === 3 && (
          <EdnaAnalysisView />
        )}
      </div>
    </div>
  );
};

// Helper Components
const FileItem = ({ idx, name, type, selected, onClick }) => {
  const icons = { csv: <Table size={18}/>, img: <ImageIcon size={18}/>, pdf: <FileText size={18}/>, dna: <Dna size={18}/> };
  const badges = { csv: "Structured", img: "Analyzed", pdf: "NLP", dna: "BLAST" };
  
  return (
    <div 
      onClick={() => onClick(idx)}
      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3
        ${selected === idx 
          ? 'bg-cyan-50 border-cyan-200 shadow-sm' 
          : 'bg-white border-slate-100 hover:border-cyan-100'}`}
    >
      <div className={`p-2 rounded-lg ${selected === idx ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
        {icons[type]}
      </div>
      <div>
        <div className="text-sm font-bold text-slate-700">{name}</div>
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{badges[type]}</div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value }) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
    <div className="text-slate-400 mb-2">{icon}</div>
    <div className="text-xs text-slate-500 uppercase font-bold">{label}</div>
    <div className="text-xl font-bold text-slate-900">{value}</div>
  </div>
);

export default UploadedDataTab;
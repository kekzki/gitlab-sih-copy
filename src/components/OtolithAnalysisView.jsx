import React from 'react';
import { ExternalLink, Clock, Ruler, BarChart2 } from 'lucide-react';

const OtolithAnalysisView = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Otolith Biological Profiling</h2>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">AI Verified</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Visual Proof */}
        <div className="space-y-6">
          {/* Image Overlay */}
          <div className="aspect-square bg-slate-900 rounded-2xl relative overflow-hidden group flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">Original Image</div>
            {/* Simulated AI Overlay */}
            <div className="absolute inset-0 border-4 border-emerald-500/50 rounded-[40%] m-12 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 border border-blue-400 rounded-full -translate-x-12 -translate-y-12"></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 border border-blue-400 rounded-full -translate-x-24 -translate-y-24"></div>
            <span className="absolute bottom-4 text-cyan-400 bg-black/50 px-3 py-1 rounded-md text-xs font-mono">
              AI Overlay Active
            </span>
          </div>
          {/* Radial Graph */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-2"><BarChart2 size={16}/> Radial Profile Analysis</h3>
            <div className="w-full h-24 border-l-2 border-b-2 border-slate-200 relative">
              <svg width="100%" height="100%" viewBox="0 0 250 100" preserveAspectRatio="none">
                <polyline points="0,100 20,80 40,90 60,40 80,60 100,20 150,50 200,10 250,30" fill="none" stroke="#06b6d4" strokeWidth="2" />
                {/* Red X marks for rings */}
                <text x="60" y="35" fill="red" fontSize="12">X</text>
                <text x="100" y="15" fill="red" fontSize="12">X</text>
                <text x="200" y="5" fill="red" fontSize="12">X</text>
              </svg>
              <span className="absolute -bottom-5 left-0 text-[10px] text-slate-400">Center</span>
              <span className="absolute -bottom-5 right-0 text-[10px] text-slate-400">Edge</span>
            </div>
          </div>
          {/* Taxonomy Link */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-500 mb-2">Taxonomy Match</h3>
            <div className="flex items-center justify-between">
              <div className="font-bold text-lg text-slate-800">Pacific Cod</div>
              <div className="text-sm font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">98% Match</div>
            </div>
            <button className="w-full mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-800 transition-colors">
              View Full Taxonomy Card <ExternalLink size={14} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Data */}
        <div className="space-y-6">
          {/* Age & Growth */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-2 text-slate-500"><Clock size={20}/> Estimated Age</div>
            <div className="text-4xl font-bold text-slate-900">3 <span className="text-2xl text-slate-500">Years</span></div>
            <div className="mt-2 text-sm text-slate-500">Ring Count: 3 Detected</div>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-2 text-slate-500"><Ruler size={20}/> Growth Rate</div>
            <div className="text-4xl font-bold text-cyan-600">49.33</div>
          </div>

          {/* Morphometrics */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-500 mb-3">Morphometrics</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-200"><td className="py-1 text-slate-600">Area</td><td className="text-right font-mono">12,450 px</td></tr>
                <tr className="border-b border-slate-200"><td className="py-1 text-slate-600">Perimeter</td><td className="text-right font-mono">450 px</td></tr>
                <tr className="border-b border-slate-200"><td className="py-1 text-slate-600">Aspect Ratio</td><td className="text-right font-mono">1.2</td></tr>
                <tr className="border-b border-slate-200"><td className="py-1 text-slate-600">Circularity</td><td className="py-1 text-right font-mono">0.89</td></tr>
                <tr><td className="pt-1 text-slate-600">Roundness</td><td className="pt-1 text-right font-mono">0.92</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtolithAnalysisView;
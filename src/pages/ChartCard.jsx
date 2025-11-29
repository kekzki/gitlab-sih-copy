import React from 'react';

const ChartCard = ({ title }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
    <h3 className="text-lg font-bold text-emerald-950 mb-4">{title}</h3>
    <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
      <p className="text-slate-400 text-sm font-medium">Chart Placeholder</p>
    </div>
  </div>
);

export default ChartCard;
import React, { useState } from 'react';
import { 
  AlertCircle, 
  Thermometer,
  Biohazard, 
  Anchor, 
  Activity, 
  ServerCrash, 
  ChevronRight,
  Clock
} from 'lucide-react';

const WarningsTab = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const alerts = [
    {
      id: 1,
      type: 'environmental',
      severity: 'critical',
      title: 'Marine Heatwave Detected',
      time: '14 mins ago',
      content: 'SST at <strong>Lakshadweep Station 4</strong> is <strong>32.1°C</strong> (+2.5°C above baseline). Risk of coral bleaching is HIGH.',
      action: 'View Heatmap Overlay'
    },
    {
      id: 2,
      type: 'biological',
      severity: 'high',
      title: 'Invasive Species Confirmed',
      time: '1 hour ago',
      content: "AI Analysis of dataset <strong>'Goa_Coast_eDNA'</strong> identified <strong>Pterois volitans (Lionfish)</strong>. Confidence: 99%.",
      action: 'Review Otolith/DNA Report'
    },
    {
      id: 3,
      type: 'fisheries',
      severity: 'medium',
      title: 'Juvenile Catch Spike',
      time: '3 hours ago',
      content: 'User reports indicate high volume of Juvenile Mackerel in <strong>Zone B</strong>. Potential spawning ground disturbance.',
      action: 'View User Reports'
    },
    {
      id: 4,
      type: 'system',
      severity: 'low',
      title: 'Sensor Data Gap',
      time: '6 hours ago',
      content: 'No signal received from <strong>NIOT Deep Sea Buoy 7</strong> for 4 hours.',
      action: 'Check Pipeline'
    },
    {
      id: 5,
      type: 'environmental',
      severity: 'critical',
      title: 'Hypoxia Alert',
      time: '8 hours ago',
      content: 'Dissolved Oxygen levels dropped to <strong>1.8 mg/L</strong> at the <strong>Andaman Trench Buoy</strong>.',
      action: 'View DO Layer'
    },
    {
      id: 6,
      type: 'fisheries',
      severity: 'critical',
      title: 'Illegal Trawling Detected',
      time: '9 hours ago',
      content: 'AIS anomaly detected for vessel <strong>IND-TS-MM-987</strong> inside a no-trawl zone.',
      action: 'Track Vessel'
    }
  ];

  const filteredAlerts = activeFilter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === activeFilter || (activeFilter === 'critical' && alert.severity === 'critical'));

  return (
    <div className="flex flex-col lg:flex-row h-[700px] bg-slate-900/60 backdrop-blur-md rounded-3xl overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: TRIAGE CONTROLS */}
      <div className="w-full lg:w-1/4 border-r border-slate-700 p-6 flex flex-col text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-500/20 rounded-full">
            <div className="p-1 bg-cyan-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg">Active Alerts</h3>
          </div>
        </div>

        <div className="space-y-2">
          <FilterButton 
            id="all" label="All Alerts" icon={<AlertCircle size={16} />} 
            count={alerts.length} active={activeFilter} onClick={setActiveFilter} color="cyan"
          />
          <div className="h-px bg-slate-700 my-2"></div>
          <FilterButton 
            id="critical" label="Critical" icon={<AlertCircle size={16} />} 
            count={alerts.filter(a => a.severity === 'critical').length} active={activeFilter} onClick={setActiveFilter} color="red"
          />
          <FilterButton 
            id="environmental" label="Environmental" icon={<Thermometer size={16} />} 
            count={alerts.filter(a => a.type === 'environmental').length} active={activeFilter} onClick={setActiveFilter} color="rose"
          />
          <FilterButton 
            id="biological" label="Biological" icon={<Biohazard size={16} />} 
            count={alerts.filter(a => a.type === 'biological').length} active={activeFilter} onClick={setActiveFilter} color="orange"
          />
          <FilterButton 
            id="fisheries" label="Fisheries" icon={<Anchor size={16} />} 
            count={alerts.filter(a => a.type === 'fisheries').length} active={activeFilter} onClick={setActiveFilter} color="yellow"
          />
          <FilterButton 
            id="system" label="System Health" icon={<Activity size={16} />} 
            count={alerts.filter(a => a.type === 'system').length} active={activeFilter} onClick={setActiveFilter} color="slate"
          />
        </div>
      </div>

      {/* 2. RIGHT PANEL: THE ALERT STREAM */}
      <div className="w-full lg:w-3/4 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Alert Stream <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full text-xs font-medium">{filteredAlerts.length} New</span>
          </h2>
          <button className="text-xs font-semibold text-cyan-400 hover:underline">Mark all as read</button>
        </div>

        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <AlertCard key={alert.id} data={alert} />
          ))}
        </div>
      </div>
    </div>
  );
};

const FilterButton = ({ id, label, icon, count, active, onClick, color }) => {
  // Tailwind CSS needs to see the full class names to generate them.
  // We create a map to store the full strings.
  const colorStyles = {
    cyan: 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20',
    red: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
    rose: 'bg-rose-500 text-white shadow-lg shadow-rose-500/20',
    orange: 'bg-orange-500 text-white shadow-lg shadow-orange-500/20',
    yellow: 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20',
    slate: 'bg-slate-500 text-white shadow-lg shadow-slate-500/20',
  };

  const inactiveStyles = "text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${active === id ? colorStyles[color] : inactiveStyles}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active === id ? 'bg-white/20' : 'bg-slate-700 text-slate-400'}`}>
        {count}
      </span>
    </button>
  );
};

const AlertCard = ({ data }) => {
  const styles = {
    environmental: { border: 'border-rose-500', gradient: 'from-rose-900/20', iconColor: 'text-rose-400', btnHover: 'hover:bg-rose-500/10 hover:border-rose-400 hover:text-rose-300', Icon: Thermometer },
    biological: { border: 'border-orange-500', gradient: 'from-orange-900/20', iconColor: 'text-orange-400', btnHover: 'hover:bg-orange-500/10 hover:border-orange-400 hover:text-orange-300', Icon: Biohazard },
    fisheries: { border: 'border-yellow-400', gradient: 'from-yellow-900/20', iconColor: 'text-yellow-400', btnHover: 'hover:bg-yellow-500/10 hover:border-yellow-400 hover:text-yellow-300', Icon: Anchor },
    system: { border: 'border-slate-500', gradient: 'from-slate-800/20', iconColor: 'text-slate-400', btnHover: 'hover:bg-slate-500/10 hover:border-slate-400 hover:text-slate-300', Icon: ServerCrash },
  };

  const theme = styles[data.type] || styles.system;
  const IconComponent = theme.Icon;

  return (
    <div className={`relative bg-slate-800/50 bg-gradient-to-r ${theme.gradient} to-transparent border border-slate-700/50 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-slate-600 transition-all border-l-4 ${theme.border}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg bg-slate-900/50 ${theme.iconColor} flex-shrink-0`}>
          <IconComponent size={24} />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-white text-lg">{data.title}</h3>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Clock size={12} /> {data.time}
            </div>
          </div>
          
          <p className="text-sm text-slate-300 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: data.content }} />
          
          <div className="flex items-center justify-end mt-4">
            <button className={`flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-lg border border-slate-700 text-slate-400 transition-colors ${theme.btnHover}`}>
              {data.action} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default WarningsTab;
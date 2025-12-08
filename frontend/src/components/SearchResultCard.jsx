import React from 'react';
import { MapPin, Calendar, Database, Fish, Activity, ArrowRight } from 'lucide-react';

const SearchResultCard = ({ type, data }) => {
  
  // Helper to safely format dates from "YYYY-MM-DD" or ISO strings
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date Unknown';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // --- 1. SPECIES CARD (Type: 'fish') ---
  // Maps to main.go struct: Species { SpeciesID, Data }
  if (type === 'fish' || type === 'species') {
    // Accessing the JSONB keys inside data.Data
    const scientificName = data.Data?.scientific_name || "Unknown Scientific Name";
    const commonName = data.Data?.vernacularname || "Unknown Common Name";
    const family = data.Data?.family || "Family Unknown";
    const date = data.Data?.eventdate;

    return (
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
        <div className="flex items-center gap-4">
          {/* Thumbnail Placeholder - If you have image_url in JSONB, use it here */}
          <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
             <Fish size={24} />
          </div>
          
          <div>
            <h4 className="font-bold text-slate-800 text-lg leading-tight">{scientificName}</h4>
            <div className="text-sm font-semibold text-slate-500 mb-1">{commonName}</div>
            
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">
                ID: {data.SpeciesID}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {formatDate(date)}
              </span>
              <span className="hidden sm:inline-block border-l border-slate-200 pl-3">
                {family}
              </span>
            </div>
          </div>
        </div>

        <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // --- 2. ECOSYSTEM/OCEANOGRAPHIC CARD ---
  // Maps to main.go struct: OceanographicData { ID, Region, Data }
  const region = data.Region || data.Data?.region || "Unknown Region";
  const date = data.Data?.eventdate;
  
  // Try to determine what the main metric of this record is
  const getPrimaryMetric = (d) => {
    if (d.temperature) return `SST: ${d.temperature}°C`;
    if (d.ph) return `pH Level: ${d.ph}`;
    if (d.salinity) return `Salinity: ${d.salinity} PSU`;
    return "Environmental Log";
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
          <Activity size={20} />
        </div>
        
        <div>
          <h4 className="font-bold text-slate-800 text-md">
            {getPrimaryMetric(data.Data || {})}
          </h4>
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
               <MapPin size={12} className="text-emerald-500"/> {region}
            </span>
            <span className="flex items-center gap-1">
               <Calendar size={12} /> {formatDate(date)}
            </span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
               <Database size={12} /> Source: {data.UploadID ? `Upload #${data.UploadID}` : 'Sensor Network'}
            </span>
          </div>
        </div>
      </div>
      
      <button className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
        View Data
      </button>
    </div>
  );
};

export default SearchResultCard;

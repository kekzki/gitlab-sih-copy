import React, { useState, useEffect } from 'react';
import { 
  ComposedChart, AreaChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Fish, Search, Loader2 } from 'lucide-react';

// Maps readable labels to likely JSON keys in the backend `data` column
const METRIC_KEY_MAP = {
  'Species Richness (S)': 'species_richness',
  'Shannon Index (H\')': 'shannon_index',
  'Simpson Index (D)': 'simpson_index',
  'Evenness (E)': 'evenness',
  'Rarefaction Curves': 'rarefaction',
  'Presence/Absence': 'presence_absence',
  'Functional Diversity': 'functional_diversity',
  'Taxonomic Diversity': 'taxonomic_diversity'
};

const DIVERSITY_METRICS = Object.keys(METRIC_KEY_MAP);

const BiodiversityCharts = ({ filters }) => {
  const [activeMetric, setActiveMetric] = useState('Species Richness (S)');
  const [selectedSpecies, setSelectedSpecies] = useState('Thunnus albacares');
  const [speciesList, setSpeciesList] = useState([]);
  
  // Chart Data States
  const [metricData, setMetricData] = useState([]);
  const [abundanceData, setAbundanceData] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingAbundance, setLoadingAbundance] = useState(false);

  // 1. Fetch Species List for Dropdown on Mount
  useEffect(() => {
    const fetchSpeciesList = async () => {
      try {
        const res = await fetch('/api/marine-trends/species-list');
        if (res.ok) {
          const names = await res.json();
          setSpeciesList(names || []);
        }
      } catch (err) {
        console.error("Failed to load species list", err);
      }
    };
    fetchSpeciesList();
  }, []);

  // 2. Fetch Biodiversity Metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      try {
        // Fetching metrics for the last 5 years by default or based on filters
        const regionParam = filters?.region ? `&region=${filters.region}` : '';
        const res = await fetch(`/api/biodiversity/metrics?start_year=2019${regionParam}`);
        
        if (res.ok) {
          const rawData = await res.json();
          
          // Transform backend data (extracting fields from the JSONB 'Data' column)
          const processed = rawData.map(item => ({
            year: item.Data.year || 0,
            value: parseFloat(item.Data[METRIC_KEY_MAP[activeMetric]] || 0)
          })).sort((a, b) => a.year - b.year);

          setMetricData(processed);
        }
      } catch (err) {
        console.error("Failed to fetch biodiversity metrics", err);
        setMetricData([]);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [activeMetric, filters?.region]);

  // 3. Fetch Abundance Data (Requires resolving Name -> ID first)
  useEffect(() => {
    const fetchAbundance = async () => {
      if (!selectedSpecies) return;
      setLoadingAbundance(true);

      try {
        // Step A: Get Species ID from Name
        const searchRes = await fetch(`/api/species?search=${encodeURIComponent(selectedSpecies)}`);
        const searchData = await searchRes.json();
        
        if (searchData && searchData.length > 0) {
          const speciesId = searchData[0].SpeciesID; // Use the first match
          
          // Step B: Fetch Abundance using ID
          const regionParam = filters?.region ? `&region=${filters.region}` : '';
          const abundanceRes = await fetch(`/api/marine-trends/abundance?species_id=${speciesId}${regionParam}`);
          const abundanceJson = await abundanceRes.json();
          
          // Transform backend data
          const processed = abundanceJson.map(item => ({
            month: item.Data.month || 'Unknown',
            count: parseInt(item.Data.count || 0, 10)
          }));
          
          setAbundanceData(processed);
        } else {
          setAbundanceData([]); // No species found
        }
      } catch (err) {
        console.error("Failed to fetch abundance data", err);
        setAbundanceData([]);
      } finally {
        setLoadingAbundance(false);
      }
    };

    // Debounce the fetch slightly to avoid hitting API on every keystroke if user types fast
    const timer = setTimeout(() => {
      fetchAbundance();
    }, 600);

    return () => clearTimeout(timer);
  }, [selectedSpecies, filters?.region]);

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

        <div className="h-[400px] w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-2 relative">
          {loadingMetrics && (
             <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
               <Loader2 className="animate-spin text-emerald-500" />
             </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={metricData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{r: 5}} 
                name={activeMetric} 
                animationDuration={1000}
              />
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
                placeholder="Search Species (e.g. Thunnus)..." 
                className="bg-transparent text-sm font-semibold text-slate-700 w-full focus:outline-none"
                onChange={(e) => setSelectedSpecies(e.target.value)}
                defaultValue={selectedSpecies}
              />
              {loadingAbundance ? (
                <Loader2 size={16} className="text-slate-400 mr-2 animate-spin" />
              ) : (
                <Search size={16} className="text-slate-400 mr-2" />
              )}
            </div>
            {/* Native Datalist for Search + Select */}
            <datalist id="species-list">
              {speciesList.map((name, idx) => (
                <option key={idx} value={name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="h-[400px] w-full relative">
          {loadingAbundance && abundanceData.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-sm text-slate-500">
               Fetching abundance data...
             </div>
          )}
          
          {abundanceData.length === 0 && !loadingAbundance ? (
             <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
               No abundance data found for this species.
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={abundanceData}>
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
          )}
        </div>
      </div>

    </div>
  );
};

export default BiodiversityCharts;

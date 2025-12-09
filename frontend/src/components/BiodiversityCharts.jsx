import React, { useState, useEffect, useCallback } from 'react';
import { 
  ComposedChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Fish, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

// --- Configuration ---

// Maps readable labels to likely JSON keys in the backend `data` column
const METRIC_KEY_MAP = {
  'Species Richness (S)': 'species_richness',
  'Shannon Index (H\')': 'shannon_index',
  'Simpson Index (D)': 'simpson_index',
  'Evenness (E)': 'evenness',
  'Functional Diversity': 'functional_diversity',
  'Taxonomic Diversity': 'taxonomic_diversity'
};
const DIVERSITY_METRICS = Object.keys(METRIC_KEY_MAP);

// Colors for the individual metrics/species
const METRIC_COLORS = {
    'Species Richness (S)': '#10b981', // Emerald
    'Shannon Index (H\')': '#3b82f6',  // Blue
    'Simpson Index (D)': '#f59e0b',    // Amber
    'Evenness (E)': '#84cc16',         // Lime
    'Functional Diversity': '#6366f1', // Indigo
    'Taxonomic Diversity': '#ef4444',  // Red
    // Note: These colors will cycle for multiple species in the Marine Trends chart
};

// --- Component ---

const BiodiversityCharts = ({ filters }) => {
  // Global Filter States
  const [metricVisibility, setMetricVisibility] = useState(() => 
    DIVERSITY_METRICS.reduce((acc, metric) => ({ ...acc, [metric]: metric === DIVERSITY_METRICS[0] }), {})
  );
  const [selectedSpeciesIDs, setSelectedSpeciesIDs] = useState({}); // { 'Species Name': ID }
  const [speciesNameList, setSpeciesNameList] = useState([]); // Array of names for the checklist
  
  // Data States
  const [metricRawData, setMetricRawData] = useState([]);
  const [abundanceRawData, setAbundanceRawData] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingAbundance, setLoadingAbundance] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Helper: Get Species ID from Name
  const resolveSpeciesID = useCallback(async (name) => {
    if (!name) return null;
    try {
        // NOTE: Uses the backend endpoint registered in main.go
        const searchRes = await fetch(`/api/species?search=${encodeURIComponent(name)}`);
        const searchData = await searchRes.json();
        return searchData && searchData.length > 0 ? searchData[0].SpeciesID : null;
    } catch (err) {
        console.error("Failed to resolve species ID", err);
        return null;
    }
  }, []);

  // 1. Fetch Species List for Checklists on Mount
  useEffect(() => {
    const fetchSpeciesList = async () => {
      try {
        const res = await fetch('/api/marine-trends/species-list');
        if (res.ok) {
          const names = await res.json();
          setSpeciesNameList(names || []);
          // Set a default selected species ID for initial load
          if (names && names.length > 0) {
              const defaultName = names[0];
              const id = await resolveSpeciesID(defaultName);
              if (id !== null) {
                  setSelectedSpeciesIDs({ [defaultName]: id });
              }
          }
        }
      } catch (err) {
        console.error("Failed to load species list", err);
      }
    };
    fetchSpeciesList();
  }, [resolveSpeciesID]);

  // 2. Fetch Biodiversity Metrics
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    setMetricRawData([]);
    
    // Use mandatory region/year filters from the main component props
    const regionParam = filters?.region ? `&region=${filters.region}` : '';
    const yearParam = filters?.year ? `&year=${filters.year}` : '';
    
    // NOTE: This endpoint requires both region and year filters
    if (!filters?.region || !filters?.year) {
        setLoadingMetrics(false);
        return; 
    }
    
    try {
      const res = await fetch(`/api/biodiversity/metrics?${yearParam}${regionParam}`);
      if (res.ok) {
        const rawData = await res.json();
        setMetricRawData(rawData); // Store raw data for dynamic charting
      }
    } catch (err) {
      console.error("Failed to fetch biodiversity metrics", err);
      setMetricRawData([]);
    } finally {
      setLoadingMetrics(false);
    }
  }, [filters?.region, filters?.year]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // 3. Fetch Abundance Data (Separate calls for each selected species)
  const fetchAbundance = useCallback(async () => {
    const speciesNames = Object.keys(selectedSpeciesIDs);
    const regionParam = filters?.region ? `&region=${filters.region}` : '';
    
    if (speciesNames.length === 0 || !filters?.region) {
        setAbundanceRawData([]);
        return;
    }
    setLoadingAbundance(true);
    setAbundanceRawData([]);

    let allAbundanceData = [];
    
    // Fetch data for all selected species IDs concurrently
    const fetchPromises = speciesNames.map(name => {
        const speciesId = selectedSpeciesIDs[name];
        // NOTE: Uses the endpoint registered in main.go
        return fetch(`/api/marine-trends/abundance?species_id=${speciesId}${regionParam}`)
            .then(res => res.json())
            .then(json => json.map(item => ({
                species: name, // Add species name for charting legend
                month: item.month || 'Unknown', // Assume backend returns mapped keys
                count: parseInt(item.count || 0, 10),
            })));
    });

    try {
        const results = await Promise.all(fetchPromises);
        // Combine results into a flat array
        results.forEach(data => {
            allAbundanceData = allAbundanceData.concat(data);
        });
        setAbundanceRawData(allAbundanceData);
    } catch (err) {
        console.error("Failed to fetch abundance data", err);
        setAbundanceRawData([]);
    } finally {
        setLoadingAbundance(false);
    }
  }, [selectedSpeciesIDs, filters?.region]);

  useEffect(() => {
    fetchAbundance();
  }, [fetchAbundance]);

  // --- UI Logic ---

  const toggleMetricVisibility = (metric) => {
    setMetricVisibility(prev => ({
        ...prev,
        [metric]: !prev[metric]
    }));
  };
  
  const toggleSpeciesSelection = async (name) => {
    const isSelected = selectedSpeciesIDs.hasOwnProperty(name);
    
    if (isSelected) {
        // Deselect
        const { [name]: removedId, ...rest } = selectedSpeciesIDs;
        setSelectedSpeciesIDs(rest);
    } else {
        // Select - need to resolve ID first
        const id = await resolveSpeciesID(name);
        if (id !== null) {
            setSelectedSpeciesIDs(prev => ({
                ...prev,
                [name]: id
            }));
        }
    }
  };

  const getMetricData = (metric) => {
    const metricKey = METRIC_KEY_MAP[metric];
    
    // Process the raw data based on the selected metric key
    return metricRawData.map(item => ({
        year: item.Data?.year || 0, // Handle optional Data field
        value: parseFloat(item.Data?.[metricKey] || 0)
    })).filter(d => d.value !== 0) 
     .sort((a, b) => a.year - b.year);
  };
  
  // Find unique months for the abundance chart (XAxis)
  const uniqueMonths = [...new Set(abundanceRawData.map(d => d.month))].sort();

  // Restructure abundance data for multi-line charting
  const abundanceChartData = uniqueMonths.map(month => {
      const point = { month };
      abundanceRawData.filter(d => d.month === month).forEach(d => {
          point[d.species] = d.count;
      });
      return point;
  });

  // --- Chart Components ---

  const SingleMetricChart = ({ metric, data }) => {
      if (!data || data.length === 0) {
          return <div className="text-sm text-slate-400 p-4">No data available for this metric/filter.</div>;
      }
      const color = METRIC_COLORS[metric];
      
      return (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-[300px] flex flex-col">
              <h4 className="font-bold text-slate-800 mb-4">{metric}</h4>
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" tick={{fontSize: 10}} />
                      <YAxis tick={{fontSize: 10}} domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={color} 
                          strokeWidth={2} 
                          dot={false} 
                          name={metric} 
                          animationDuration={500}
                      />
                  </ComposedChart>
              </ResponsiveContainer>
          </div>
      );
  };
  
  // --- Render ---

  return (
    <div className="flex space-x-6">
      
      {/* LEFT PANEL: FILTERS & CHECKLISTS */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'w-full lg:w-1/4' : 'w-12 lg:w-16'} 
                       bg-white p-4 rounded-3xl border border-slate-200 shadow-sm overflow-y-auto relative z-10`}>
        
        <div className={`flex items-start ${sidebarOpen ? 'justify-between' : 'justify-center'} mb-4`}>
          {sidebarOpen && <h3 className="font-bold text-slate-900">Chart Controls</h3>}
          <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
          >
              {sidebarOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        
        {sidebarOpen && (
            <div className="space-y-6">
                
                {/* 1. BIODIVERSITY METRICS CHECKLIST */}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Biodiversity Metrics</h4>
                    <div className="space-y-1">
                        {DIVERSITY_METRICS.map((metric) => (
                            <label
                                key={metric}
                                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors border
                                    ${metricVisibility[metric] ? 'bg-emerald-50 border-emerald-200' : 'border-transparent hover:bg-slate-50'}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={metricVisibility[metric]}
                                    onChange={() => toggleMetricVisibility(metric)}
                                    className="accent-emerald-500 w-4 h-4"
                                />
                                <span className={`text-xs font-semibold ${metricVisibility[metric] ? "text-emerald-900" : "text-slate-600"}`}>
                                    {metric}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <hr className="border-slate-200" />
                
                {/* 2. MARINE TRENDS SPECIES CHECKLIST */}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider flex items-center gap-2">
                        <Fish size={14} /> Marine Trends Species
                    </h4>
                    <p className="text-[10px] text-slate-400 mb-2">Select species for abundance chart.</p>
                    <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-100 p-2 rounded-lg">
                        {speciesNameList.length === 0 ? (
                            <p className="text-xs text-slate-400">Loading species list...</p>
                        ) : (
                            speciesNameList.map((name) => (
                                <label
                                    key={name}
                                    className={`flex items-center gap-3 cursor-pointer p-1 rounded-lg transition-colors 
                                        ${selectedSpeciesIDs.hasOwnProperty(name) ? 'bg-cyan-50' : 'hover:bg-slate-50'}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedSpeciesIDs.hasOwnProperty(name)}
                                        onChange={() => toggleSpeciesSelection(name)}
                                        className="accent-cyan-500 w-4 h-4"
                                    />
                                    <span className="text-xs text-slate-700">{name}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* RIGHT PANEL: CHARTS */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'w-full lg:w-3/4' : 'w-full'} space-y-8`}>
        
        {/* A. BIODIVERSITY METRICS GRID */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Biodiversity Metrics</h3>
          
          {loadingMetrics ? (
             <div className="flex items-center justify-center h-[200px] bg-slate-50/50 rounded-2xl border border-slate-100">
               <Loader2 className="animate-spin text-emerald-500" size={32} />
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DIVERSITY_METRICS.map(metric => {
                  if (metricVisibility[metric]) {
                      const data = getMetricData(metric);
                      return <SingleMetricChart key={metric} metric={metric} data={data} />;
                  }
                  return null;
              })}
              {!Object.values(metricVisibility).some(v => v) && (
                  <p className="md:col-span-2 text-sm text-slate-400 p-4">Select at least one metric to display its time-series chart.</p>
              )}
            </div>
          )}
        </div>

        {/* B. MARINE TRENDS (Multi-Species Abundance) - NOW USING LINE CHART */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Marine Trends: Abundance</h3>
          <p className="text-xs text-slate-500 mb-6">Comparing abundance of selected species over time/month.</p>

          <div className="h-[400px] w-full relative">
            {loadingAbundance && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-sm text-slate-500">
                    <Loader2 size={24} className="animate-spin mr-2" /> Fetching abundance data...
                </div>
            )}
            
            {(abundanceChartData.length === 0 && !loadingAbundance) ? (
               <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                 No abundance data found for the selected species/filters.
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {/* CHANGED from AreaChart to LineChart */}
                <LineChart data={abundanceChartData}> 
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  
                  {Object.keys(selectedSpeciesIDs).map((speciesName, index) => (
                      <Line 
                          key={speciesName}
                          type="monotone" 
                          dataKey={speciesName} 
                          stroke={METRIC_COLORS[DIVERSITY_METRICS[index % DIVERSITY_METRICS.length]]} // Cycle through colors
                          strokeWidth={2} 
                          dot={false}
                          name={speciesName} 
                      />
                  ))}
                  {/* REMOVED Area component */}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiodiversityCharts;




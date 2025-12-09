// src/components/FilterSidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Calendar, Shield, Waves } from "lucide-react";
import "./FilterSidebar.css";

const FilterSidebar = ({ onFilterChange, allSpecies = [], regionsFromServer = [], currentFilters }) => {
  const [expandedSections, setExpandedSections] = useState({
    classification: true,
    time: true,
    location: true,
    conservation: true,
    quality: true,
    depth: true,
  });

  const [filters, setFilters] = useState(
    currentFilters || {
      classifications: [],
      observationPeriod: null,
      regions: [],
      conservationStatus: [],
      dataQuality: [],
      depthRange: [0, 5000],
    }
  );

  useEffect(() => {
    if (currentFilters) setFilters(currentFilters);
  }, [currentFilters]);

  const uniqueClassifications = useMemo(() => {
    const s = new Set();
    allSpecies.forEach((sp) => {
      const d = sp.data || {};
      if (d.class) s.add(d.class);
    });
    return Array.from(s).sort();
  }, [allSpecies]);

  const uniqueRegions = useMemo(() => {
    // prefer server-supplied regions if available, otherwise derive from allSpecies
    if (Array.isArray(regionsFromServer) && regionsFromServer.length > 0) return regionsFromServer;
    const s = new Set();
    allSpecies.forEach((sp) => {
      const d = sp.data || {};
      const rr = d.reported_regions || d.reportedRegions;
      if (Array.isArray(rr)) rr.forEach((r) => r && s.add(r));
      else if (typeof rr === "string") {
        try {
          const parsed = JSON.parse(rr);
          if (Array.isArray(parsed)) parsed.forEach((r) => r && s.add(r));
        } catch {
          rr.split(",").map(t => t.trim()).forEach((r) => r && s.add(r));
        }
      }
    });
    return Array.from(s).sort();
  }, [allSpecies, regionsFromServer]);

  const uniqueConservationStatus = useMemo(() => {
    const s = new Set();
    allSpecies.forEach((sp) => {
      const d = sp.data || {};
      const st = d.iucn_status || d.iucnStatus || d.conservation_status;
      if (st) s.add(st);
    });
    return Array.from(s).sort();
  }, [allSpecies]);

  const uniqueDataQuality = useMemo(() => {
    const s = new Set();
    allSpecies.forEach((sp) => {
      const d = sp.data || {};
      if (d.dataQuality) s.add(d.dataQuality);
    });
    return Array.from(s).sort();
  }, [allSpecies]);

  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const handleFilterChangeLocal = (category, value) => {
    const nf = { ...filters };
    if (category === "observationPeriod") {
      nf.observationPeriod = nf.observationPeriod === value ? null : value;
    } else if (category === "depthRange") {
      nf.depthRange = value;
    } else if (Array.isArray(nf[category])) {
      const idx = nf[category].indexOf(value);
      nf[category] = idx > -1 ? [...nf[category].slice(0, idx), ...nf[category].slice(idx + 1)] : [...nf[category], value];
    }
    setFilters(nf);
    if (onFilterChange) onFilterChange(nf);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.classifications.length > 0) count++;
    if (filters.observationPeriod) count++;
    if (filters.regions.length > 0) count++;
    if (filters.conservationStatus.length > 0) count++;
    if (filters.dataQuality && filters.dataQuality.length > 0) count++;
    return count;
  };

  const clearAllFilters = () => {
    const reset = {
      classifications: [],
      observationPeriod: null,
      regions: [],
      conservationStatus: [],
      dataQuality: [],
      depthRange: [0, 5000],
    };
    setFilters(reset);
    if (onFilterChange) onFilterChange(reset);
  };

  const observationPeriodOptions = [
    { value: "last24h", label: "Last 24 Hours" },
    { value: "last7d", label: "Last 7 Days" },
    { value: "last30d", label: "Last 30 Days" },
    { value: "last1y", label: "Last 1 Year" },
    { value: "last5y", label: "Last 5 Years" },
    { value: "allTime", label: "All Time" },
  ];

  const conservationStatusColors = {
    "Critically Endangered": "#dc2626",
    Endangered: "#ea580c",
    Vulnerable: "#eab308",
    "Near Threatened": "#f59e0b",
    "Least Concern": "#16a34a",
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3 className="filter-title">
          Filters {getActiveFilterCount() > 0 && <span className="filter-badge">{getActiveFilterCount()}</span>}
        </h3>
      </div>

      {/* Classification */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection("classification")}>
          <span>📊 Classification</span>
          {expandedSections.classification ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.classification && (
          <div className="filter-options">
            {uniqueClassifications.length > 0 ? uniqueClassifications.map(c => (
              <label key={c} className="filter-checkbox">
                <input type="checkbox" checked={filters.classifications.includes(c)} onChange={() => handleFilterChangeLocal("classifications", c)} />
                <span>{c}</span>
              </label>
            )) : <p className="no-options">No classifications available</p>}
          </div>
        )}
      </div>

      {/* Observation Period */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection("time")}>
          <span><Calendar size={16} className="inline-icon" /> Observation Period</span>
          {expandedSections.time ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.time && (
          <div className="filter-options">
            {observationPeriodOptions.map(opt => (
              <label key={opt.value} className="filter-checkbox">
                <input type="radio" name="observationPeriod" checked={filters.observationPeriod === opt.value} onChange={() => handleFilterChangeLocal("observationPeriod", opt.value)} />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Regions */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection("location")}>
          <span><MapPin size={16} className="inline-icon" /> Geographic Region</span>
          {expandedSections.location ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.location && (
          <div className="filter-options">
            {uniqueRegions.length > 0 ? uniqueRegions.map(r => (
              <label key={r} className="filter-checkbox">
                <input type="checkbox" checked={filters.regions.includes(r)} onChange={() => handleFilterChangeLocal("regions", r)} />
                <span>{r}</span>
              </label>
            )) : <p className="no-options">No regions available</p>}
          </div>
        )}
      </div>

      {/* Conservation Status */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection("conservation")}>
          <span><Shield size={16} className="inline-icon" /> Conservation Status</span>
          {expandedSections.conservation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.conservation && (
          <div className="filter-options">
            {uniqueConservationStatus.length > 0 ? uniqueConservationStatus.map(s => (
              <label key={s} className="filter-checkbox">
                <input type="checkbox" checked={filters.conservationStatus.includes(s)} onChange={() => handleFilterChangeLocal("conservationStatus", s)} />
                <span>
                  <span className="status-dot" style={{ backgroundColor: conservationStatusColors[s] || "#999" }}></span>
                  {s}
                </span>
              </label>
            )) : <p className="no-options">No conservation statuses available</p>}
          </div>
        )}
      </div>

      {/* Data Quality */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection("quality")}>
          <span>✓ Data Quality</span>
          {expandedSections.quality ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.quality && (
          <div className="filter-options">
            {uniqueDataQuality.length > 0 ? uniqueDataQuality.map(q => (
              <label key={q} className="filter-checkbox">
                <input type="checkbox" checked={filters.dataQuality.includes(q)} onChange={() => handleFilterChangeLocal("dataQuality", q)} />
                <span>{q}</span>
              </label>
            )) : <p className="no-options">No data quality options available</p>}
          </div>
        )}
      </div>

      {/* Depth */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection("depth")}>
          <span><Waves size={16} className="inline-icon" /> Habitat Depth</span>
          {expandedSections.depth ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.depth && (
          <div className="filter-options">
            <div className="depth-range">
              <span>0m - 5000m</span>
              <input type="range" min="0" max="5000" value={filters.depthRange[1]} onChange={(e) => handleFilterChangeLocal("depthRange", [0, parseInt(e.target.value, 10)])} className="depth-slider" />
              <span className="depth-value">Max: {filters.depthRange[1]}m</span>
            </div>
          </div>
        )}
      </div>

      <div className="filter-actions">
        <button className="clear-filters-btn" onClick={clearAllFilters}>Clear All</button>
      </div>
    </aside>
  );
};

export default FilterSidebar;

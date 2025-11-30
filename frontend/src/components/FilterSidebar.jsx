import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Calendar, Shield, Waves } from 'lucide-react';
import './FilterSidebar.css';

const FilterSidebar = ({ onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    classification: true,
    time: true,
    location: true,
    conservation: true,
    quality: true,
    depth: true
  });

  const [filters, setFilters] = useState({
    classification: [],
    timeRange: '',
    locations: [],
    conservation: [],
    verified: false,
    aiAnalyzed: false,
    ednaConfirmed: false,
    depthRange: [0, 5000]
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (category, value) => {
    const newFilters = { ...filters };
    
    if (category === 'timeRange') {
      newFilters.timeRange = value;
    } else if (category === 'depthRange') {
      newFilters.depthRange = value;
    } else if (Array.isArray(newFilters[category])) {
      const index = newFilters[category].indexOf(value);
      if (index > -1) {
        newFilters[category].splice(index, 1);
      } else {
        newFilters[category].push(value);
      }
    } else {
      newFilters[category] = !newFilters[category];
    }
    
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.classification.length > 0) count++;
    if (filters.timeRange) count++;
    if (filters.locations.length > 0) count++;
    if (filters.conservation.length > 0) count++;
    if (filters.verified || filters.aiAnalyzed || filters.ednaConfirmed) count++;
    return count;
  };

  const clearAllFilters = () => {
    const resetFilters = {
      classification: [],
      timeRange: '',
      locations: [],
      conservation: [],
      verified: false,
      aiAnalyzed: false,
      ednaConfirmed: false,
      depthRange: [0, 5000]
    };
    setFilters(resetFilters);
    if (onFilterChange) onFilterChange(resetFilters);
  };

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3 className="filter-title">
          Filters {getActiveFilterCount() > 0 && (
            <span className="filter-badge">{getActiveFilterCount()}</span>
          )}
        </h3>
      </div>

      {/* Classification Filter */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection('classification')}>
          <span>📊 Classification</span>
          {expandedSections.classification ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.classification && (
          <div className="filter-options">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.classification.includes('Actinopterygii')}
                onChange={() => handleFilterChange('classification', 'Actinopterygii')}
              />
              <span>Actinopterygii (Ray-finned)</span>
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.classification.includes('Chondrichthyes')}
                onChange={() => handleFilterChange('classification', 'Chondrichthyes')}
              />
              <span>Chondrichthyes (Cartilaginous)</span>
            </label>
          </div>
        )}
      </div>

      {/* Time Filter */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection('time')}>
          <span><Calendar size={16} className="inline-icon" /> Observation Period</span>
          {expandedSections.time ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.time && (
          <div className="filter-options">
            <select
              className="filter-select"
              value={filters.timeRange}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            >
              <option value="">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="6m">Last 6 Months</option>
            </select>
          </div>
        )}
      </div>

      {/* Location Filter */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection('location')}>
          <span><MapPin size={16} className="inline-icon" /> Geographic Region</span>
          {expandedSections.location ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.location && (
          <div className="filter-options">
            {['Bay of Bengal', 'Arabian Sea', 'Lakshadweep Islands', 'Andaman & Nicobar'].map(loc => (
              <label key={loc} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.locations.includes(loc)}
                  onChange={() => handleFilterChange('locations', loc)}
                />
                <span>{loc}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Conservation Status */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection('conservation')}>
          <span><Shield size={16} className="inline-icon" /> Conservation Status</span>
          {expandedSections.conservation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.conservation && (
          <div className="filter-options">
            {[
              { value: 'CR', label: 'Critically Endangered', color: '#dc2626' },
              { value: 'EN', label: 'Endangered', color: '#ea580c' },
              { value: 'VU', label: 'Vulnerable', color: '#eab308' },
              { value: 'LC', label: 'Least Concern', color: '#16a34a' }
            ].map(status => (
              <label key={status.value} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.conservation.includes(status.value)}
                  onChange={() => handleFilterChange('conservation', status.value)}
                />
                <span>
                  <span className="status-dot" style={{ backgroundColor: status.color }}></span>
                  {status.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Data Quality */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection('quality')}>
          <span>✓ Data Quality</span>
          {expandedSections.quality ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.quality && (
          <div className="filter-options">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={() => handleFilterChange('verified', null)}
              />
              <span>Only Verified Species</span>
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.aiAnalyzed}
                onChange={() => handleFilterChange('aiAnalyzed', null)}
              />
              <span>AI-Analyzed Records</span>
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.ednaConfirmed}
                onChange={() => handleFilterChange('ednaConfirmed', null)}
              />
              <span>eDNA Confirmed</span>
            </label>
          </div>
        )}
      </div>

      {/* Depth Range */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection('depth')}>
          <span><Waves size={16} className="inline-icon" /> Habitat Depth</span>
          {expandedSections.depth ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.depth && (
          <div className="filter-options">
            <div className="depth-range">
              <span>0m - 5000m</span>
              <input
                type="range"
                min="0"
                max="5000"
                value={filters.depthRange[1]}
                onChange={(e) => handleFilterChange('depthRange', [0, parseInt(e.target.value)])}
                className="depth-slider"
              />
              <span className="depth-value">Max: {filters.depthRange[1]}m</span>
            </div>
          </div>
        )}
      </div>

      <div className="filter-actions">
        <button className="clear-filters-btn" onClick={clearAllFilters}>
          Clear All
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
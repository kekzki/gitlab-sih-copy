import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Shield,
  Waves,
} from "lucide-react";
import "./FilterSidebar.css";

const FilterSidebar = ({ onFilterChange, allSpecies = [] }) => {
  const [expandedSections, setExpandedSections] = useState({
    classification: true,
    time: true,
    location: true,
    conservation: true,
    quality: true,
    depth: true,
  });

  const [filters, setFilters] = useState({
    classifications: [],
    observationPeriod: null,
    regions: [],
    conservationStatus: [],
    dataQuality: [],
    depthRange: [0, 5000],
  });

  // Extract unique values from species data
  const uniqueClassifications = useMemo(() => {
    return [...new Set(allSpecies.map((s) => s.class))];
  }, [allSpecies]);

  const uniqueRegions = useMemo(() => {
    const regions = new Set();
    allSpecies.forEach((species) => {
      species.reportedRegions.forEach((region) => regions.add(region));
    });
    return Array.from(regions).sort();
  }, [allSpecies]);

  const uniqueConservationStatus = useMemo(() => {
    return [...new Set(allSpecies.map((s) => s.iucnStatus))];
  }, [allSpecies]);

  const uniqueDataQuality = useMemo(() => {
    return [...new Set(allSpecies.map((s) => s.dataQuality))];
  }, [allSpecies]);

  const conservationStatusColors = {
    "Critically Endangered": "#dc2626",
    Endangered: "#ea580c",
    Vulnerable: "#eab308",
    "Near Threatened": "#f59e0b",
    "Least Concern": "#16a34a",
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (category, value) => {
    const newFilters = { ...filters };

    if (category === "observationPeriod") {
      newFilters.observationPeriod =
        newFilters.observationPeriod === value ? null : value;
    } else if (category === "depthRange") {
      newFilters.depthRange = value;
    } else if (Array.isArray(newFilters[category])) {
      const index = newFilters[category].indexOf(value);
      if (index > -1) {
        newFilters[category].splice(index, 1);
      } else {
        newFilters[category].push(value);
      }
    }

    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.classifications.length > 0) count++;
    if (filters.observationPeriod) count++;
    if (filters.regions.length > 0) count++;
    if (filters.conservationStatus.length > 0) count++;
    if (filters.dataQuality.length > 0) count++;
    return count;
  };

  const clearAllFilters = () => {
    const resetFilters = {
      classifications: [],
      observationPeriod: null,
      regions: [],
      conservationStatus: [],
      dataQuality: [],
      depthRange: [0, 5000],
    };
    setFilters(resetFilters);
    if (onFilterChange) onFilterChange(resetFilters);
  };

  const observationPeriodOptions = [
    { value: "last24h", label: "Last 24 Hours" },
    { value: "last7d", label: "Last 7 Days" },
    { value: "last30d", label: "Last 30 Days" },
    { value: "last1y", label: "Last 1 Year" },
    { value: "last5y", label: "Last 5 Years" },
    { value: "allTime", label: "All Time" },
  ];

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3 className="filter-title">
          Filters{" "}
          {getActiveFilterCount() > 0 && (
            <span className="filter-badge">{getActiveFilterCount()}</span>
          )}
        </h3>
      </div>

      {/* Classification Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("classification")}
        >
          <span>📊 Classification</span>
          {expandedSections.classification ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
        {expandedSections.classification && (
          <div className="filter-options">
            {uniqueClassifications.length > 0 ? (
              uniqueClassifications.map((classification) => (
                <label key={classification} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.classifications.includes(classification)}
                    onChange={() =>
                      handleFilterChange("classifications", classification)
                    }
                  />
                  <span>{classification}</span>
                </label>
              ))
            ) : (
              <p className="no-options">No classifications available</p>
            )}
          </div>
        )}
      </div>

      {/* Time Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("time")}
        >
          <span>
            <Calendar size={16} className="inline-icon" /> Observation Period
          </span>
          {expandedSections.time ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
        {expandedSections.time && (
          <div className="filter-options">
            <div className="time-period-options">
              {observationPeriodOptions.map((option) => (
                <label key={option.value} className="filter-checkbox">
                  <input
                    type="radio"
                    name="observationPeriod"
                    value={option.value}
                    checked={filters.observationPeriod === option.value}
                    onChange={() =>
                      handleFilterChange("observationPeriod", option.value)
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Location Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("location")}
        >
          <span>
            <MapPin size={16} className="inline-icon" /> Geographic Region
          </span>
          {expandedSections.location ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
        {expandedSections.location && (
          <div className="filter-options">
            {uniqueRegions.length > 0 ? (
              uniqueRegions.map((region) => (
                <label key={region} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.regions.includes(region)}
                    onChange={() => handleFilterChange("regions", region)}
                  />
                  <span>{region}</span>
                </label>
              ))
            ) : (
              <p className="no-options">No regions available</p>
            )}
          </div>
        )}
      </div>

      {/* Conservation Status */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("conservation")}
        >
          <span>
            <Shield size={16} className="inline-icon" /> Conservation Status
          </span>
          {expandedSections.conservation ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
        {expandedSections.conservation && (
          <div className="filter-options">
            {uniqueConservationStatus.length > 0 ? (
              uniqueConservationStatus.map((status) => (
                <label key={status} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.conservationStatus.includes(status)}
                    onChange={() =>
                      handleFilterChange("conservationStatus", status)
                    }
                  />
                  <span>
                    <span
                      className="status-dot"
                      style={{
                        backgroundColor:
                          conservationStatusColors[status] || "#999",
                      }}
                    ></span>
                    {status}
                  </span>
                </label>
              ))
            ) : (
              <p className="no-options">No conservation statuses available</p>
            )}
          </div>
        )}
      </div>

      {/* Data Quality */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("quality")}
        >
          <span>✓ Data Quality</span>
          {expandedSections.quality ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
        {expandedSections.quality && (
          <div className="filter-options">
            {uniqueDataQuality.length > 0 ? (
              uniqueDataQuality.map((quality) => (
                <label key={quality} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.dataQuality.includes(quality)}
                    onChange={() => handleFilterChange("dataQuality", quality)}
                  />
                  <span>{quality}</span>
                </label>
              ))
            ) : (
              <p className="no-options">No data quality options available</p>
            )}
          </div>
        )}
      </div>

      {/* Depth Range */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("depth")}
        >
          <span>
            <Waves size={16} className="inline-icon" /> Habitat Depth
          </span>
          {expandedSections.depth ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
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
                onChange={(e) =>
                  handleFilterChange("depthRange", [
                    0,
                    parseInt(e.target.value),
                  ])
                }
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

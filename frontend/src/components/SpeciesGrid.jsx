import React, { useState, useMemo } from "react";
import SpeciesCard from "./SpeciesCard";
import "./SpeciesGrid.css";

const SpeciesGrid = ({ species, onSpeciesClick, resultCount }) => {
  const [sortBy, setSortBy] = useState("name-asc");

  const sortedSpecies = useMemo(() => {
    if (!species || !Array.isArray(species)) return [];

    return [...species].sort((a, b) => {
      // Helper to safely access nested JSONB data
      // Fallback to empty string/date if missing to avoid crashes
      const getVal = (item, key) => (item.Data && item.Data[key] ? item.Data[key] : "");
      
      switch (sortBy) {
        case "name-asc":
          return getVal(a, "vernacularname").localeCompare(getVal(b, "vernacularname"));
        case "name-desc":
          return getVal(b, "vernacularname").localeCompare(getVal(a, "vernacularname"));
        
        case "recent":
          const dateA = new Date(getVal(a, "eventdate") || 0);
          const dateB = new Date(getVal(b, "eventdate") || 0);
          return dateB - dateA; // Newest first
        
        case "conservation":
          const statusOrder = {
            "Critically Endangered": 0,
            "Endangered": 1,
            "Vulnerable": 2,
            "Near Threatened": 3,
            "Least Concern": 4,
            "Data Deficient": 5,
            "Unknown": 6
          };
          
          const statusA = getVal(a, "iucn_status") || "Unknown";
          const statusB = getVal(b, "iucn_status") || "Unknown";
          
          const scoreA = statusOrder[statusA] !== undefined ? statusOrder[statusA] : 6;
          const scoreB = statusOrder[statusB] !== undefined ? statusOrder[statusB] : 6;
          
          return scoreA - scoreB; // Higher priority (lower score) first
          
        default:
          return 0;
      }
    });
  }, [species, sortBy]);

  const displayCount = resultCount !== undefined ? resultCount : species.length;

  return (
    <div className="species-grid-container">
      <div className="species-grid-header">
        <div className="species-count">{displayCount} Species Found</div>
        <div className="species-sort">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="recent">Recent Sightings</option>
            <option value="conservation">Conservation Status</option>
          </select>
        </div>
      </div>

      <div className="species-grid">
        {sortedSpecies.map((sp) => (
          // Use SpeciesID from main.go struct as key
          <SpeciesCard key={sp.SpeciesID} species={sp} onClick={onSpeciesClick} />
        ))}
      </div>

      {species.length === 0 && (
        <div className="no-results">
          <p>No species found matching your criteria.</p>
          <p className="no-results-hint">
            Try adjusting your filters or search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default SpeciesGrid;

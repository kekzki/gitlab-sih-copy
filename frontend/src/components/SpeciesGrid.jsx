import React, { useState, useMemo } from "react";
import SpeciesCard from "./SpeciesCard";
import "./SpeciesGrid.css";

const SpeciesGrid = ({ species, onSpeciesClick, resultCount }) => {
  const [sortBy, setSortBy] = useState("name-asc");

  const sortedSpecies = useMemo(() => {
    return [...species].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.vernacularName.localeCompare(b.vernacularName);
        case "name-desc":
          return b.vernacularName.localeCompare(a.vernacularName);
        case "recent":
          return new Date(b.lastSightingDate) - new Date(a.lastSightingDate);
        case "conservation":
          const statusOrder = {
            "Critically Endangered": 0,
            Endangered: 1,
            Vulnerable: 2,
            "Near Threatened": 3,
            "Least Concern": 4,
          };
          return (
            (statusOrder[a.iucnStatus] || 5) - (statusOrder[b.iucnStatus] || 5)
          );
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
          <SpeciesCard key={sp.id} species={sp} onClick={onSpeciesClick} />
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

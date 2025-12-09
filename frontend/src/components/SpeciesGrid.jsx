// src/components/SpeciesGrid.jsx
import React, { useMemo, useState } from "react";
import SpeciesCard from "./SpeciesCard";
import "./SpeciesGrid.css";

const SpeciesGrid = ({ species = [], onSpeciesClick, resultCount }) => {
  const [sortBy, setSortBy] = useState("name-asc");

  const sortedSpecies = useMemo(() => {
    if (!Array.isArray(species)) return [];

    return [...species].sort((a, b) => {
      const da = a.data || {};
      const db = b.data || {};
      const nameA = (da.vernacularName || da.vernacularname || da.scientific_name || "").toString().toLowerCase();
      const nameB = (db.vernacularName || db.vernacularname || db.scientific_name || "").toString().toLowerCase();

      switch (sortBy) {
        case "name-asc":
          return nameA.localeCompare(nameB);
        case "name-desc":
          return nameB.localeCompare(nameA);
        case "conservation":
          const order = {
            "Critically Endangered": 0,
            "Endangered": 1,
            "Vulnerable": 2,
            "Near Threatened": 3,
            "Least Concern": 4,
            "Data Deficient": 5,
            "Unknown": 6,
          };
          const sa = (da.iucn_status || da.iucnStatus || da.conservation_status) || "Unknown";
          const sb = (db.iucn_status || db.iucnStatus || db.conservation_status) || "Unknown";
          const scoreA = order[sa] !== undefined ? order[sa] : 6;
          const scoreB = order[sb] !== undefined ? order[sb] : 6;
          return scoreA - scoreB;
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
          <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="conservation">Conservation Status</option>
          </select>
        </div>
      </div>

      <div className="species-grid">
        {sortedSpecies.map((sp) => (
          <SpeciesCard key={sp.species_id ?? sp.SpeciesID} species={sp} onClick={onSpeciesClick} />
        ))}
      </div>

      {species.length === 0 && (
        <div className="no-results">
          <p>No species found matching your criteria.</p>
          <p className="no-results-hint">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
};

export default SpeciesGrid;

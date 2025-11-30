import React, { useState } from 'react';
import SpeciesCard from './SpeciesCard';
import './SpeciesGrid.css';

const SpeciesGrid = ({ species, onSpeciesClick }) => {
  const [sortBy, setSortBy] = useState('name-asc');

  const sortedSpecies = [...species].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.commonName.localeCompare(b.commonName);
      case 'name-desc':
        return b.commonName.localeCompare(a.commonName);
      case 'recent':
        return new Date(b.lastSighting) - new Date(a.lastSighting);
      case 'conservation':
        const statusOrder = { 'CR': 0, 'EN': 1, 'VU': 2, 'LC': 3, 'DD': 4 };
        return (statusOrder[a.conservationStatus] || 5) - (statusOrder[b.conservationStatus] || 5);
      default:
        return 0;
    }
  });

  return (
    <div className="species-grid-container">
      <div className="species-grid-header">
        <div className="species-count">
          {species.length} Species Found
        </div>
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
          <SpeciesCard 
            key={sp.id} 
            species={sp} 
            onClick={onSpeciesClick}
          />
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
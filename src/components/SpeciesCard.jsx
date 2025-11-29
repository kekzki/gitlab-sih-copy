import React from 'react';
import { Fish } from 'lucide-react';
import './SpeciesCard.css';

const SpeciesCard = ({ species, onClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      'CR': '#dc2626',
      'EN': '#ea580c',
      'VU': '#eab308',
      'LC': '#16a34a',
      'DD': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'CR': 'Critically Endangered',
      'EN': 'Endangered',
      'VU': 'Vulnerable',
      'LC': 'Least Concern',
      'DD': 'Data Deficient'
    };
    return labels[status] || 'Unknown';
  };

  return (
    <div className="species-card" onClick={() => onClick && onClick(species)}>
      <div className="species-card-image">
        {species.imageUrl ? (
          <img src={species.imageUrl} alt={species.commonName} />
        ) : (
          <div className="species-card-placeholder">
            <Fish size={48} />
          </div>
        )}
      </div>
      <div className="species-card-content">
        <h3 className="species-common-name">{species.commonName}</h3>
        <p className="species-scientific-name">{species.scientificName}</p>
        {species.conservationStatus && (
          <span 
            className="species-status-badge"
            style={{ backgroundColor: getStatusColor(species.conservationStatus) }}
          >
            {getStatusLabel(species.conservationStatus)}
          </span>
        )}
      </div>
    </div>
  );
};

export default SpeciesCard;
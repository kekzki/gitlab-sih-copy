import React from "react";
import { Fish } from "lucide-react";
import "./SpeciesCard.css";

const SpeciesCard = ({ species, onClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      "Critically Endangered": "#dc2626",
      Endangered: "#ea580c",
      Vulnerable: "#eab308",
      "Near Threatened": "#f59e0b",
      "Least Concern": "#16a34a",
      "Data Deficient": "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  return (
    <div className="species-card" onClick={() => onClick && onClick(species)}>
      <div className="species-card-image">
        {species.thumbnailUrl ? (
          <img src={species.thumbnailUrl} alt={species.vernacularName} />
        ) : (
          <div className="species-card-placeholder">
            <Fish size={48} />
          </div>
        )}
      </div>
      <div className="species-card-content">
        <h3 className="species-common-name">{species.vernacularName}</h3>
        <p className="species-scientific-name">{species.scientificName}</p>
        {species.iucnStatus && (
          <span
            className="species-status-badge"
            style={{ backgroundColor: getStatusColor(species.iucnStatus) }}
          >
            {species.iucnStatus}
          </span>
        )}
      </div>
    </div>
  );
};

export default SpeciesCard;

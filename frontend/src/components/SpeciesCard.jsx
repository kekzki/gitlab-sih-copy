import React from "react";
import { Fish } from "lucide-react";
import "./SpeciesCard.css";

const SpeciesCard = ({ species, onClick }) => {
  // Extract fields safely from the JSONB 'Data' column
  // Your Go struct is { SpeciesID: int, Data: { ... } }
  const details = species.Data || {};
  
  const scientificName = details.scientific_name || "Unknown Scientific Name";
  const commonName = details.vernacularname || details.common_name || "Unknown Common Name";
  const iucnStatus = details.iucn_status || details.conservation_status;
  // Assuming image_url might be in the JSON, otherwise null
  const imageUrl = details.image_url || details.thumbnail_url;

  const getStatusColor = (status) => {
    if (!status) return "#6b7280";
    
    // Normalize status string for matching (case-insensitive)
    const normalized = status.toLowerCase();
    
    if (normalized.includes("critical")) return "#dc2626"; // Red
    if (normalized.includes("endangered")) return "#ea580c"; // Orange
    if (normalized.includes("vulnerable")) return "#eab308"; // Yellow
    if (normalized.includes("near")) return "#f59e0b"; // Amber
    if (normalized.includes("least")) return "#16a34a"; // Green
    
    return "#6b7280"; // Gray/Data Deficient
  };

  return (
    <div className="species-card" onClick={() => onClick && onClick(species)}>
      <div className="species-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={commonName} />
        ) : (
          <div className="species-card-placeholder">
            {/* Visual fallback if no image exists in DB */}
            <Fish size={48} strokeWidth={1.5} />
          </div>
        )}
      </div>
      
      <div className="species-card-content">
        <h3 className="species-common-name">{commonName}</h3>
        <p className="species-scientific-name">{scientificName}</p>
        
        {iucnStatus && (
          <span
            className="species-status-badge"
            style={{ backgroundColor: getStatusColor(iucnStatus) }}
          >
            {iucnStatus}
          </span>
        )}
        
        {/* Optional: Add ID for debugging/reference */}
        <span className="text-[10px] text-gray-400 mt-2 block">ID: {species.SpeciesID}</span>
      </div>
    </div>
  );
};

export default SpeciesCard;

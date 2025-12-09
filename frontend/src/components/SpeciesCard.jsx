// src/components/SpeciesCard.jsx
import React from "react";
import { Fish } from "lucide-react";
import "./SpeciesCard.css";
import placeholder from "../assets/placeholderimg.png";


const safeStr = (v) => (typeof v === "string" ? v : "");

const SpeciesCard = ({ species, onClick }) => {
  // species is { species_id, upload_id, data }
  const d = species.data || {};

  const scientificName = safeStr(d.scientific_name || d.scientificName);
  const commonName = safeStr(d.vernacularName || d.vernacularname || d.common_name);
  const iucnStatus = safeStr(d.iucn_status || d.iucnStatus || d.conservation_status);

  // image resolution: image_urls array -> image_url -> thumbnail_url
  let imageUrl = null;
  if (d.image_urls) {
    if (Array.isArray(d.image_urls) && d.image_urls.length > 0) {
      imageUrl = safeStr(d.image_urls[0]);
    } else if (typeof d.image_urls === "string") {
      // try parse JSON array
      try {
        const parsed = JSON.parse(d.image_urls);
        if (Array.isArray(parsed) && parsed.length > 0) imageUrl = safeStr(parsed[0]);
      } catch {
        const parts = d.image_urls.split(",");
        if (parts.length > 0) imageUrl = safeStr(parts[0]);
      }
    }
  }
  if (!imageUrl) imageUrl = safeStr(d.image_url || d.thumbnail_url);

  const getStatusColor = (status) => {
    if (!status) return "#6b7280";
    const normalized = status.toLowerCase();
    if (normalized.includes("critical")) return "#dc2626";
    if (normalized.includes("endangered")) return "#ea580c";
    if (normalized.includes("vulnerable")) return "#eab308";
    if (normalized.includes("near")) return "#f59e0b";
    if (normalized.includes("least")) return "#16a34a";
    return "#6b7280";
  };

  const id = species.species_id ?? species.SpeciesID;

  return (
    <div className="species-card" onClick={() => onClick && onClick(species)}>
      <div className="species-card-image">
        {imageUrl ? (
         <img
  src={imageSrc}
  alt={commonName || scientificName || "species image"}
  onError={(e) => {
    e.currentTarget.onerror = null;   // Prevent infinite loop
    e.currentTarget.src = placeholder;
  }}
/> 
        ) : (
          <div className="species-card-placeholder">
            <Fish size={48} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="species-card-content">
        <h3 className="species-common-name">{commonName || "Unknown Common Name"}</h3>
        <p className="species-scientific-name">{scientificName || "Unknown Scientific Name"}</p>

        {iucnStatus && (
          <span className="species-status-badge" style={{ backgroundColor: getStatusColor(iucnStatus) }}>
            {iucnStatus}
          </span>
        )}

        <span className="text-[10px] text-gray-400 mt-2 block">ID: {id}</span>
      </div>
    </div>
  );
};

export default SpeciesCard;

import React from 'react';
import { MapPin, Calendar, Anchor, FileText } from 'lucide-react';
import './ObservationCard.css';

const ObservationCard = ({ observation }) => {
  return (
    <div className="observation-card">
      <h3 className="observation-title">📍 Latest Sighting</h3>
      
      <div className="observation-list">
        <div className="observation-item">
          <Calendar size={18} className="observation-icon" />
          <div className="observation-content">
            <span className="observation-label">Date</span>
            <span className="observation-value">{observation.date}</span>
          </div>
        </div>

        <div className="observation-item">
          <MapPin size={18} className="observation-icon" />
          <div className="observation-content">
            <span className="observation-label">Location</span>
            <span className="observation-value">{observation.location}</span>
          </div>
        </div>

        <div className="observation-item">
          <Anchor size={18} className="observation-icon" />
          <div className="observation-content">
            <span className="observation-label">Depth</span>
            <span className="observation-value">{observation.depth}</span>
          </div>
        </div>

        <div className="observation-item">
          <FileText size={18} className="observation-icon" />
          <div className="observation-content">
            <span className="observation-label">Source</span>
            <span className="observation-value">{observation.source}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservationCard;
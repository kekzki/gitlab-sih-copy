import React from 'react';
import { MapPin, Calendar, Database } from 'lucide-react';

const SearchResultCard = ({ type, data }) => {
  if (type === 'fish') {
    return (
      <div className="result-card">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '8px' }}></div>
          <div className="card-info">
            <h4>{data.commonName}</h4>
            <div className="card-meta">
              <span>{data.speciesId}</span>
              <span><Calendar size={14} /> {data.date}</span>
            </div>
          </div>
        </div>
        <button className="btn-view">View Record</button>
      </div>
    );
  }

  // Ecosystem Record
  return (
    <div className="result-card">
      <div className="card-info">
        <h4>{data.parameter} Analysis</h4>
        <div className="card-meta">
          <span><MapPin size={14} /> {data.location}</span>
          <span><Database size={14} /> Source: {data.source}</span>
        </div>
      </div>
      <button className="btn-view" style={{ background: '#5dd9c1', color: '#0d3d3d' }}>
        View Data
      </button>
    </div>
  );
};

export default SearchResultCard;
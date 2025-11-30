import React from 'react';
import './StatsCard.css';

const StatsCard = ({ icon: Icon, value, label }) => {
  return (
    <div className="stats-card">
      <div className="stats-icon">
        <Icon size={32} />
      </div>
      <div className="stats-value">{value}</div>
      <div className="stats-label">{label}</div>
    </div>
  );
};

export default StatsCard;
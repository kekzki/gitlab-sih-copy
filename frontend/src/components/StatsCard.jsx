import React from 'react';
import { HelpCircle } from 'lucide-react'; // Fallback icon
import './StatsCard.css';

const StatsCard = ({ icon: Icon, value, label }) => {
  // Safety: Use the passed Icon, or a fallback if missing
  const DisplayIcon = Icon || HelpCircle;

  return (
    <div className="stats-card">
      <div className="stats-icon">
        <DisplayIcon size={32} />
      </div>
      <div className="stats-value">{value || 0}</div>
      <div className="stats-label">{label || "Unknown"}</div>
    </div>
  );
};

export default StatsCard;

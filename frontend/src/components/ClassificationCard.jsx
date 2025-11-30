import React from 'react';
import { ChevronRight } from 'lucide-react';
import './ClassificationCard.css';

const ClassificationCard = ({ classification }) => {
  const levels = [
    { key: 'kingdom', label: 'Kingdom', value: classification.kingdom },
    { key: 'phylum', label: 'Phylum', value: classification.phylum },
    { key: 'class', label: 'Class', value: classification.class },
    { key: 'order', label: 'Order', value: classification.order },
    { key: 'family', label: 'Family', value: classification.family },
    { key: 'genus', label: 'Genus', value: classification.genus },
    { key: 'species', label: 'Species', value: classification.species }
  ];

  return (
    <div className="classification-card">
      <h3 className="classification-title">📊 Taxonomic Classification</h3>
      <div className="classification-hierarchy">
        {levels.map((level, index) => (
          <div key={level.key} className="classification-row">
            <span className="classification-label">{level.label}</span>
            <ChevronRight size={16} className="classification-arrow" />
            <span className="classification-value">{level.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassificationCard;
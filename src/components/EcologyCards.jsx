import React from 'react';
import { Home, Utensils, Map } from 'lucide-react';
import './EcologyCards.css';

const EcologyCards = ({ ecology }) => {
  const cards = [
    {
      icon: Home,
      label: 'Habitat',
      value: ecology.habitat
    },
    {
      icon: Utensils,
      label: 'Diet',
      value: ecology.diet
    },
    {
      icon: Map,
      label: 'Range',
      value: ecology.range
    }
  ];

  return (
    <div className="ecology-cards-grid">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="ecology-card">
            <Icon size={24} className="ecology-icon" />
            <div className="ecology-label">{card.label}</div>
            <div className="ecology-value">{card.value}</div>
          </div>
        );
      })}
    </div>
  );
};

export default EcologyCards;
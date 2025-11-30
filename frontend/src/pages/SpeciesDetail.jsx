
import { useParams, Link } from 'react-router-dom';
import './Taxonomy.css';

import React, { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import ClassificationCard from '../components/ClassificationCard';
import AIStatusPanel from '../components/AIStatusPanel';
import ObservationCard from '../components/ObservationCard';
import EcologyCards from '../components/EcologyCards';
import TabbedFooter from '../components/TabbedFooter';
import './SpeciesDetail.css';

const SpeciesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - replace with API call using the id
  const species = {
    id: id,
    commonName: 'Bluefin Tuna',
    scientificName: 'Thunnus thynnus',
    conservationStatus: 'EN',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
    classification: {
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Actinopterygii',
      order: 'Perciformes',
      family: 'Scombridae',
      genus: 'Thunnus',
      species: 'T. thynnus'
    },
    description: 'The Atlantic bluefin tuna is a species of tuna in the family Scombridae. It is the largest of the tuna species and can live up to 40 years. Known for their speed and power, they are highly prized in commercial fishing.',
    ecology: {
      habitat: 'Pelagic Zone',
      diet: 'Carnivore',
      range: 'Atlantic Ocean'
    },
    aiAnalysis: {
      verified: true,
      otolithAvailable: true,
      ednaAvailable: true,
      imagesAnalyzed: 47
    },
    latestObservation: {
      date: 'Nov 15, 2024',
      location: '12.97°N, 74.82°E',
      depth: '45m',
      source: 'Research Vessel XYZ'
    },
    metrics: {
      avgDepth: '67.3m',
      avgTemp: '24.5°C'
    }
  };

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
    <div className="species-detail-page">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/taxonomy')}>
        <ArrowLeft size={20} />
        Back to Species List
      </button>

      {/* Hero Section */}
      <div className="species-hero">
        <div className="species-hero-image">
          <img src={species.imageUrl} alt={species.commonName} />
        </div>
        <div className="species-hero-content">
          <h1 className="species-hero-title">{species.commonName}</h1>
          <h2 className="species-hero-subtitle">{species.scientificName}</h2>
          <span 
            className="species-hero-badge"
            style={{ backgroundColor: getStatusColor(species.conservationStatus) }}
          >
            {getStatusLabel(species.conservationStatus)}
          </span>
          <button className="otolith-report-btn">
            <ExternalLink size={20} />
            View Otolith AI Report
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="species-content">
        {/* Left Column */}
        <div className="species-left-column">
          <ClassificationCard classification={species.classification} />
          
          <div className="species-description-card">
            <h3>📝 Description</h3>
            <p>{species.description}</p>
          </div>

          <EcologyCards ecology={species.ecology} />
        </div>

        {/* Right Column */}
        <div className="species-right-column">
          <AIStatusPanel analysis={species.aiAnalysis} />
          <ObservationCard observation={species.latestObservation} />
          
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Avg Depth</div>
              <div className="metric-value">{species.metrics.avgDepth}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg Temp</div>
              <div className="metric-value">{species.metrics.avgTemp}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Footer */}
      <TabbedFooter speciesId={species.id} />
    </div>
  );
};

export default SpeciesDetail;


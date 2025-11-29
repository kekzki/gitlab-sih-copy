import React, { useState } from 'react';
import TaxonomySearch from '../components/TaxonomySearch';
import FilterSidebar from '../components/FilterSidebar';
import SpeciesGrid from '../components/SpeciesGrid';
import './Taxonomy.css';

const Taxonomy = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  // Mock data - replace with actual API call
  const mockSpecies = [
    {
      id: 1,
      commonName: 'Bluefin Tuna',
      scientificName: 'Thunnus thynnus',
      conservationStatus: 'EN',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
      lastSighting: '2024-11-20'
    },
    {
      id: 2,
      commonName: 'Great White Shark',
      scientificName: 'Carcharodon carcharias',
      conservationStatus: 'VU',
      imageUrl: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400',
      lastSighting: '2024-11-18'
    },
    {
      id: 3,
      commonName: 'Clownfish',
      scientificName: 'Amphiprioninae',
      conservationStatus: 'LC',
      imageUrl: 'https://images.unsplash.com/photo-1520990894801-df1493ada628?w=400',
      lastSighting: '2024-11-22'
    },
    {
      id: 4,
      commonName: 'Manta Ray',
      scientificName: 'Mobula birostris',
      conservationStatus: 'EN',
      imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400',
      lastSighting: '2024-11-19'
    },
    {
      id: 5,
      commonName: 'Sea Turtle',
      scientificName: 'Chelonioidea',
      conservationStatus: 'VU',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      lastSighting: '2024-11-21'
    },
    {
      id: 6,
      commonName: 'Dolphin',
      scientificName: 'Delphinus delphis',
      conservationStatus: 'LC',
      imageUrl: 'https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=400',
      lastSighting: '2024-11-23'
    }
  ];

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSpeciesClick = (species) => {
    // Navigate to species detail page
    window.location.href = `/taxonomy/${species.id}`;
  };

  // Filter species based on search and filters
  const filteredSpecies = mockSpecies.filter(species => {
    if (searchTerm && !species.commonName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !species.scientificName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filters.conservation && filters.conservation.length > 0 &&
        !filters.conservation.includes(species.conservationStatus)) {
      return false;
    }

    return true;
  });

  return (
    <div className="taxonomy-page">
      <TaxonomySearch onSearch={handleSearch} />
      
      <div className="taxonomy-content">
        <FilterSidebar onFilterChange={handleFilterChange} />
        <SpeciesGrid species={filteredSpecies} onSpeciesClick={handleSpeciesClick} />
      </div>
    </div>
  );
};

export default Taxonomy;
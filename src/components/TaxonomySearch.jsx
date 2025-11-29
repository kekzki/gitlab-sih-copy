import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import './TaxonomySearch.css';

const TaxonomySearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="taxonomy-search-container">
      <div className="taxonomy-search-header">
        <h1 className="taxonomy-search-title">Search</h1>
        <div className="taxonomy-search-bar-wrapper">
          <div className="taxonomy-search-bar">
            <Search className="search-icon" size={24} />
            <input
              type="text"
              placeholder="Search by species name, scientific name..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="clear-button">
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxonomySearch;
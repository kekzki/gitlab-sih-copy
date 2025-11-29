import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SearchTabs from '../components/SearchTabs';
import SearchResultCard from '../components/SearchResultCard';
import AIAnalysisLab from '../components/AIAnalysisLab';
import { Sparkles, Search } from 'lucide-react';

// Images
import oceanBg from '/Users/ritesh/sih_project/Paradoxx6/src/assets/pexels-francesco-ungaro-3168998.jpg'; // Or your main explore bg
import './Search.css'; 

const SearchPage = () => {
  
  
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'lab'

  // Dummy data for Explore Tab
  const dummyResults = [
    { type: 'fish', commonName: 'Atlantic Cod', speciesId: '#8821', date: 'Oct 24, 2024' },
    { type: 'ecosystem', parameter: 'Salinity', location: 'Bay of Bengal', source: 'NOAA', date: 'Oct 22, 2024' },
    { type: 'fish', commonName: 'Mackerel', speciesId: '#9901', date: 'Oct 20, 2024' },
  ];

  return (
    
    <div className="search-page">
      
      <div className="search-container">
        {/* Top Tabs */}
        <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* --- TAB 1: EXPLORE DATABASE --- */}
        {activeTab === 'explore' && (
          <div className="explore-content">
            {/* Main Explore Hero */}
            <div className="search-hero-box">
              <div className="search-hero-bg-image" style={{ backgroundImage: `url(${oceanBg})` }}></div>
              <div className="search-hero-content">
                <h1 className="search-hero-title">Explore Database</h1>
                <div className="search-input-wrapper">
                  <Sparkles color="#2d6a6a" size={20} />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Ask Paradoxx6 AI... e.g., 'Tuna sightings in 2024'"
                  />
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <Search color="#2d6a6a" size={24} />
                  </button>
                </div>
              </div>
            </div>
            
            <h3 style={{ marginBottom: '1rem', color: '#2d6a6a' }}>Recent Records</h3>
            <div className="results-grid">
              {dummyResults.map((item, index) => (
                <SearchResultCard 
                  key={index} 
                  type={item.type} 
                  data={item} 
                />
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 2: AI LAB --- */}
        {activeTab === 'lab' && (
          <AIAnalysisLab />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
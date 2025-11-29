import React from 'react';
import { Search, FlaskConical } from 'lucide-react';

const SearchTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs-header">
      <button 
        className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
        onClick={() => onTabChange('explore')}
      >
        <Search size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
        Explore Database
      </button>
      <button 
        className={`tab-btn ${activeTab === 'lab' ? 'active' : ''}`}
        onClick={() => onTabChange('lab')}
      >
        <FlaskConical size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
        AI Lab: Deep Analysis
      </button>
    </div>
  );
};

export default SearchTabs;
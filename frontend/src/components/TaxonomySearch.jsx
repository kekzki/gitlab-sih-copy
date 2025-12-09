import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const TaxonomySearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title / Breadcrumb Area */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Taxonomic Database</h1>
          <p className="text-xs text-slate-500 mt-0.5">Browse and filter marine species catalog</p>
        </div>

        {/* Search Input Area */}
        <div className="w-full md:w-1/2 lg:w-1/3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={20} />
          </div>
          <input
            type="text"
            className="w-full bg-slate-100 text-slate-900 placeholder-slate-500 border border-transparent rounded-xl py-2.5 pl-10 pr-10 focus:border-cyan-500 focus:bg-white focus:ring-0 transition-all outline-none text-sm font-medium"
            placeholder="Search by species or scientific name..."
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default TaxonomySearch;

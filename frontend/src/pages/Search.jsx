import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Assuming you have this wrapper layout elsewhere, but kept import
import { Link, useNavigate } from 'react-router-dom';
import SearchTabs from '../components/SearchTabs';
import SearchResultCard from '../components/SearchResultCard';
import AIAnalysisLab from '../components/AIAnalysisLab';
import { Sparkles, Search, Loader2 } from 'lucide-react';

// Images - Keep your existing asset import
import oceanBg from '../assets/Homepageturtle.jpg'; 
import './Search.css'; 

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'lab'
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Initial Load: Fetch some "Recent" data to populate the page
  // We'll combine some species and oceanographic logs for variety
  useEffect(() => {
    if (activeTab === 'explore' && !isSearching) {
      fetchRecentData();
    }
  }, [activeTab]);

  const fetchRecentData = async () => {
    setLoading(true);
    try {
      // Fetch latest ocean parameters as "recent activity"
      const oceanRes = await fetch('/api/oceanographic/parameters?region=Pacific&start_date=2023-01-01'); // Broad query
      const oceanData = await oceanRes.json();
      
      // Limit to 6 items and tag them
      const mixedResults = (oceanData || []).slice(0, 6).map(item => ({
        id: `ocean-${item.ID}`,
        type: 'ecosystem',
        data: item // Pass the whole struct {ID, Region, Data}
      }));

      setResults(mixedResults);
    } catch (err) {
      console.error("Failed to load recent data", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Search Handler (Targeting /api/species)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
        setIsSearching(false);
        fetchRecentData();
        return;
    }

    setLoading(true);
    setIsSearching(true);

    try {
      const res = await fetch(`/api/species?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      // Transform for the card component
      const searchResults = (data || []).map(item => ({
        id: `species-${item.SpeciesID}`,
        type: 'fish', // This triggers the "Species" card layout
        data: item // {SpeciesID, Data}
      }));

      setResults(searchResults);
    } catch (err) {
      console.error("Search failed", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

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
              <div 
                className="search-hero-bg-image" 
                style={{ 
                    backgroundImage: `url(${oceanBg})`,
                    filter: 'brightness(0.6)' // Added dimming for text readability
                }}
              ></div>
              
              <div className="search-hero-content">
                <h1 className="search-hero-title">Explore Database</h1>
                
                <form onSubmit={handleSearch} className="search-input-wrapper">
                  <Sparkles className="text-cyan-700" size={20} />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search species (e.g. 'Tuna') or regions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="border-none bg-transparent cursor-pointer p-0 flex items-center">
                    {loading ? <Loader2 className="animate-spin text-cyan-700" size={24} /> : <Search className="text-cyan-700" size={24} />}
                  </button>
                </form>

              </div>
            </div>
            
            {/* Results Section */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-700 mb-4 px-2">
                    {isSearching ? `Search Results (${results.length})` : 'Recent Database Activity'}
                </h3>
                
                {loading && results.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-cyan-600" size={40} />
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.map((item) => (
                        <Link 
                            to={item.type === 'fish' ? `/taxonomy/${item.data.SpeciesID}` : '#'} 
                            key={item.id} 
                            className="block hover:no-underline"
                        >
                          <SearchResultCard 
                            type={item.type} 
                            data={item.data} 
                          />
                        </Link>
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500 font-semibold">No records found matching "{searchQuery}"</p>
                        <button 
                            onClick={() => {setSearchQuery(''); setIsSearching(false); fetchRecentData();}}
                            className="mt-2 text-cyan-600 font-bold hover:underline"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
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

export default SearchPage

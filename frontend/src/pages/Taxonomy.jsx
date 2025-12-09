// src/pages/Taxonomy.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TaxonomySearch from "../components/TaxonomySearch";
import FilterSidebar from "../components/FilterSidebar";
import SpeciesGrid from "../components/SpeciesGrid";
import "./Taxonomy.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

const Taxonomy = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    classifications: [], // values are expected to match data->>'class'
    regions: [],         // values will be sent to backend (if you later enable server-side regions)
    conservationStatus: [],
    dataQuality: [],
    depthRange: [0, 5000],
  });

  const [species, setSpecies] = useState([]); // array of { species_id, upload_id, data }
  const [regions, setRegions] = useState([]); // fetched from /api/filters/regions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Build query string using params your backend supports: `search` and `class`
  const buildSpeciesQuery = () => {
    const params = new URLSearchParams();

    if (searchTerm) params.set("search", searchTerm);

    // backend supports a single class param; if multiple are set we pass the first one
    if (filters.classifications && filters.classifications.length > 0) {
      params.set("class", filters.classifications[0]);
    }

    return params.toString();
  };

  useEffect(() => {
    // Fetch regions list once from backend
    const fetchRegions = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/filters/regions`);
        if (!res.ok) throw new Error(`regions API ${res.status}`);
        const data = await res.json();
        setRegions(Array.isArray(data) ? data : []);
      } catch (err) {
        // Non-fatal: sidebar will handle empty regions
        console.warn("Failed to fetch regions:", err);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    const fetchSpecies = async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = buildSpeciesQuery();
        const url = `${API_BASE}/api/species${qs ? "?" + qs : ""}`;
        const res = await fetch(url, { signal: abort.signal });
        if (!res.ok) throw new Error(`species API ${res.status}`);
        const data = await res.json();
        // Expect array of { species_id, upload_id, data }
        setSpecies(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecies();
    return () => abort.abort();
  }, [searchTerm, filters]);

  const handleSearch = (term) => setSearchTerm(term);
  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleSpeciesClick = (sp) => {
    const id = sp.species_id ?? sp.SpeciesID;
    navigate(`/taxonomy/${id}`);
  };

  return (
    <div className="taxonomy-page">
      <TaxonomySearch onSearch={handleSearch} />

      <div className="taxonomy-content">
        <FilterSidebar
          onFilterChange={handleFilterChange}
          allSpecies={species}
          regionsFromServer={regions}
          currentFilters={filters}
        />

        <div style={{ flex: 1 }}>
          {loading && <div className="loading">Loading species...</div>}
          {error && <div className="error">Error: {error}</div>}

          <SpeciesGrid
            species={species}
            onSpeciesClick={handleSpeciesClick}
            resultCount={species.length}
          />
        </div>
      </div>
    </div>
  );
};

export default Taxonomy;

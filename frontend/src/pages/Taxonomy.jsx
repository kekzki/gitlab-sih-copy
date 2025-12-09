import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TaxonomySearch from "../components/TaxonomySearch";
import FilterSidebar from "../components/FilterSidebar";
import SpeciesGrid from "../components/SpeciesGrid";
// import { mockSpeciesData } from "../mockSpeciesData"; // <-- REMOVED MOCK DATA
import { fetchSpeciesData } from "../api/species"; // <-- IMPORT NEW API FUNCTION
import "./Taxonomy.css";

const Taxonomy = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    classifications: [],
    observationPeriod: null,
    regions: [],
    conservationStatus: [],
    dataQuality: [],
    depthRange: [0, 5000],
  });
  
  // New state to hold data fetched from the backend BEFORE client-side filtering
  const [rawSpeciesData, setRawSpeciesData] = useState([]); 
  const [loading, setLoading] = useState(false);

  // --- API DATA FETCHING ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Pass 'searchTerm' and the current 'classifications' to the API
      const data = await fetchSpeciesData(searchTerm, filters.classifications);
      setRawSpeciesData(data);
      setLoading(false);
    };

    // Use a slight debounce for search and filter changes sent to the API
    const debounceTimer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(debounceTimer); // Cleanup on unmount or re-render
  }, [searchTerm, filters.classifications]); // Re-fetch only when these two API-related states change

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSpeciesClick = (species) => {
    navigate(`/taxonomy/${species.id}`);
  };

  // --- CLIENT-SIDE FILTERING (For unsupported filters like Region, IUCN, Depth) ---
  const filteredSpecies = useMemo(() => {
    // Start with the data fetched from the API (which is already pre-filtered by search/class)
    let speciesToFilter = rawSpeciesData;

    // NOTE: Search and Class are handled by the API call in useEffect.
    // We only need to handle the filters NOT supported by the /api/species endpoint here.

    // 1. SEARCH FILTER (Handled by API, but keeping for consistency if search is slow/complex)
    if (searchTerm && filters.classifications.length > 1) { 
        // If more than one class is selected, the API only filtered by the first one,
        // so we must finish the classification filter here.
        if (filters.classifications.length > 1) {
            speciesToFilter = speciesToFilter.filter(species => 
                filters.classifications.includes(species.class)
            );
        }
    }
    
    // 2. OBSERVATION PERIOD FILTER (Last sighting date - NOT supported by Go API, filter locally)
    if (filters.observationPeriod) {
      speciesToFilter = speciesToFilter.filter((species) => {
        const lastSighting = new Date(species.lastSightingDate);
        const now = new Date();
        const daysDifference = Math.floor(
          (now - lastSighting) / (1000 * 60 * 60 * 24)
        );

        let isInRange = false;
        switch (filters.observationPeriod) {
          case "last24h":
            isInRange = daysDifference <= 1;
            break;
          case "last7d":
            isInRange = daysDifference <= 7;
            break;
          case "last30d":
            isInRange = daysDifference <= 30;
            break;
          case "last1y":
            isInRange = daysDifference <= 365;
            break;
          case "last5y":
            isInRange = daysDifference <= 1825;
            break;
          case "allTime":
            isInRange = true;
            break;
          default:
            isInRange = true;
        }
        return isInRange;
      });
    }

    // 3. GEOGRAPHIC REGION FILTER (NOT supported by Go API, filter locally)
    if (filters.regions.length > 0) {
      speciesToFilter = speciesToFilter.filter((species) => {
        return species.reportedRegions.some((region) =>
          filters.regions.includes(region)
        );
      });
    }

    // 4. CONSERVATION STATUS FILTER (NOT supported by Go API, filter locally)
    if (filters.conservationStatus.length > 0) {
      speciesToFilter = speciesToFilter.filter((species) =>
        filters.conservationStatus.includes(species.iucnStatus)
      );
    }

    // 5. DATA QUALITY FILTER (NOT supported by Go API, filter locally)
    if (filters.dataQuality.length > 0) {
      speciesToFilter = speciesToFilter.filter((species) =>
        filters.dataQuality.includes(species.dataQuality)
      );
    }

    // 6. HABITAT DEPTH FILTER (NOT supported by Go API, filter locally)
    if (filters.depthRange) {
      speciesToFilter = speciesToFilter.filter((species) => {
        const [minDepth, maxDepth] = filters.depthRange;
        const speciesMinDepth = species.depthRangeMin;
        const speciesMaxDepth = species.depthRangeMax;

        // Check for overlap:
        return !(speciesMaxDepth < minDepth || speciesMinDepth > maxDepth);
      });
    }

    return speciesToFilter;
  }, [rawSpeciesData, filters]); // Depends only on raw data and client-side filters

  return (
    <div className="taxonomy-page">
      <TaxonomySearch onSearch={handleSearch} />

      <div className="taxonomy-content">
        <FilterSidebar
          onFilterChange={handleFilterChange}
          // Pass the currently fetched species for dynamic filter options
          allSpecies={rawSpeciesData} 
        />
        <SpeciesGrid
          species={filteredSpecies}
          onSpeciesClick={handleSpeciesClick}
          resultCount={loading ? "..." : filteredSpecies.length}
          loading={loading} // Pass loading state to SpeciesGrid
        />
      </div>
    </div>
  );
};

export default Taxonomy;
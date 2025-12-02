import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TaxonomySearch from "../components/TaxonomySearch";
import FilterSidebar from "../components/FilterSidebar";
import SpeciesGrid from "../components/SpeciesGrid";
import { mockSpeciesData } from "../mockSpeciesData";
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

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSpeciesClick = (species) => {
    navigate(`/taxonomy/${species.id}`);
  };

  // Filter species based on ALL conditions (AND logic)
  const filteredSpecies = useMemo(() => {
    return mockSpeciesData.filter((species) => {
      // 1. SEARCH FILTER
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          species.vernacularName.toLowerCase().includes(searchLower) ||
          species.scientificName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // 2. CLASSIFICATION FILTER (Class)
      if (filters.classifications.length > 0) {
        if (!filters.classifications.includes(species.class)) {
          return false;
        }
      }

      // 3. OBSERVATION PERIOD FILTER (Last sighting date)
      if (filters.observationPeriod) {
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

        if (!isInRange) return false;
      }

      // 4. GEOGRAPHIC REGION FILTER
      if (filters.regions.length > 0) {
        const hasMatchingRegion = species.reportedRegions.some((region) =>
          filters.regions.includes(region)
        );
        if (!hasMatchingRegion) return false;
      }

      // 5. CONSERVATION STATUS FILTER
      if (filters.conservationStatus.length > 0) {
        if (!filters.conservationStatus.includes(species.iucnStatus)) {
          return false;
        }
      }

      // 6. DATA QUALITY FILTER
      if (filters.dataQuality.length > 0) {
        if (!filters.dataQuality.includes(species.dataQuality)) {
          return false;
        }
      }

      // 7. HABITAT DEPTH FILTER
      if (filters.depthRange) {
        const [minDepth, maxDepth] = filters.depthRange;
        // Check if species depth range overlaps with selected range
        const speciesMinDepth = species.depthRangeMin;
        const speciesMaxDepth = species.depthRangeMax;

        // No overlap if: species ends before min OR species starts after max
        if (speciesMaxDepth < minDepth || speciesMinDepth > maxDepth) {
          return false;
        }
      }

      return true;
    });
  }, [searchTerm, filters]);

  return (
    <div className="taxonomy-page">
      <TaxonomySearch onSearch={handleSearch} />

      <div className="taxonomy-content">
        <FilterSidebar
          onFilterChange={handleFilterChange}
          allSpecies={mockSpeciesData}
        />
        <SpeciesGrid
          species={filteredSpecies}
          onSpeciesClick={handleSpeciesClick}
          resultCount={filteredSpecies.length}
        />
      </div>
    </div>
  );
};

export default Taxonomy;

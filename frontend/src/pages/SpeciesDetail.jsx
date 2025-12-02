import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Map,
  Database,
  Dna,
  Activity,
  Fish,
  Ruler,
  Clock,
  Thermometer,
  Egg,
  HeartPulse,
  Anchor,
  Droplets,
  Scale,
  Microscope,
  Brain,
  Utensils,
  Baby,
  Wind,
} from "lucide-react";
import "./SpeciesDetail.css";

// --- Internal Helper Components ---

const TraitRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-3 rounded-lg transition-colors group">
    <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-700">
      {label}
    </span>
    <span className="text-sm font-bold text-slate-900 text-right">{value}</span>
  </div>
);

const SectionHeader = ({ icon: Icon, title, color = "blue" }) => (
  <div
    className={`flex items-center gap-2 mb-5 pb-3 border-b-2 border-${color}-100`}
  >
    <div className={`p-2 rounded-lg bg-${color}-50`}>
      <Icon className={`text-${color}-600`} size={20} />
    </div>
    <h3 className={`text-lg font-bold text-${color}-900`}>{title}</h3>
  </div>
);

const SpeciesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("map");

  // --- MOCK DATA: EXHAUSTIVE LIST BASED ON YOUR PROMPT ---
  const species = {
    id: id,
    // 1. Core Identity
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    commonName: "Atlantic Bluefin Tuna",
    scientificName: "Thunnus thynnus",
    conservationStatus: "EN", // Endangered

    // 2. Taxonomy
    classification: {
      kingdom: "Animalia",
      phylum: "Chordata",
      class: "Actinopterygii",
      order: "Scombriformes",
      family: "Scombridae",
      genus: "Thunnus",
      species: "T. thynnus",
    },

    // 3. Description & Ecology
    description:
      "The Atlantic bluefin tuna is a species of tuna in the family Scombridae. It is one of the largest, fastest, and most gorgeously colored of all the world’s fishes.",
    ecology: {
      habitat: "Pelagic Zone (Open Ocean)",
      diet: "Carnivorous (Herring, Mackerel, Squid)",
      range: "North Atlantic Ocean & Mediterranean Sea",
    },

    // 4. AI & System Status
    aiAnalysis: {
      otolithAvailable: true,
      ednaAvailable: true,
      imagesAnalyzed: 142,
    },

    // 5. Sightings & Metrics
    latestObservation: {
      date: "Nov 15, 2024",
      location: "12.97°N, 74.82°E (Bay of Bengal)",
      depth: "45m",
      source: "Research Vessel Sagar Kanya",
    },
    metrics: {
      avgDepth: "67.3 m",
      avgTemp: "24.5 °C",
    },

    // --- 6. FISH ABUNDANCE DATA ---
    abundance: {
      totalCount: "12,450 (Est. Regional)",
      cpue: "14.2 kg/hook",
      density: "0.4 individuals / km²",
      biomass: "850 Tons",
      speciesSpecificAbundance: "High in Zone B",
      juvAdultRatio: "40% Juvenile / 60% Adult",
      temporalAbundance: "Peak: Monsoon (June-Aug)",
      spatialAbundance: "Concentrated: Upwelling Zones",
      recruitmentLevels: "Moderate (Year Class 2023)",
    },

    // --- 7. LIFE HISTORY TRAITS ---

    // A. Growth
    growthTraits: {
      maxSize: "3.7 m (L∞)", // L infinity
      maxWeight: "680 kg",
      maxAge: "35 years",
      ageAtMaturity: "4-5 years", // Moved here for context
      growthRate: "0.24 K (von Bertalanffy)",
      vonBertalanffyParams: "L∞=320, K=0.18, t0=-0.5",
    },

    // B. Reproductive
    reproductiveTraits: {
      fecundity: "10 Million eggs/year",
      spawningSeason: "May - July",
      sizeAtMaturity: "115 cm (Fork Length)",
      sexRatio: "1:1 (M:F)",
      eggDiameter: "1.0 - 1.2 mm",
      spawningFrequency: "Daily (during season)",
    },

    // C. Survival
    survivalTraits: {
      mortalityRate: "0.14 M (Natural)",
      longevity: "35+ Years",
      recruitmentSuccess: "Variable (Climate Dependent)",
      larvalSurvivalRate: "< 1% (High Attrition)",
    },

    // D. Feeding Ecology
    feedingEcology: {
      dietComposition: "Teleosts (80%), Cephalopods (20%)",
      trophicLevel: "4.5 (Apex Predator)",
    },

    // E. Developmental
    developmentalTraits: {
      larvalDuration: "20 - 30 Days",
      metamorphosisTiming: "25 Days post-hatch",
    },

    // F. Behavioural
    behaviouralTraits: {
      migrationPatterns: "Trans-Atlantic (Annual)",
      habitatPreference: "Epipelagic / Mesopelagic",
    },

    // G. Physiological
    physiologicalTraits: {
      thermalTolerance: "3°C - 30°C",
      salinityTolerance: "33 - 38 PSU",
      metabolicTraits: "Endothermic Capacity",
      oxygenUseEfficiency: "High (Ram Ventilation)",
    },

    // Footer Data
    datasets: [
      {
        title: "Tuna Migration Patterns 2023",
        author: "Dr. A. Kumar",
        date: "2023-10-12",
      },
      {
        title: "Mediterranean Spawning Survey",
        author: "INCOIS",
        date: "2024-01-05",
      },
    ],
    ednaHistory: [
      { date: "2024-11-01", region: "Gulf of Mannar", match: "99.8%" },
      { date: "2024-10-15", region: "Lakshadweep", match: "97.2%" },
    ],
  };

  const getStatusColor = (status) => {
    const map = {
      CR: "bg-red-500",
      EN: "bg-orange-500",
      VU: "bg-yellow-500",
      LC: "bg-emerald-500",
    };
    return map[status] || "bg-slate-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800">
      {/* 1. HERO SECTION */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-cyan-600 mb-6 transition-colors font-medium"
          >
            <ArrowLeft size={18} /> Back to Taxonomy
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-slate-100 relative group">
                <img
                  src={species.imageUrl}
                  alt={species.commonName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-white text-xs font-bold shadow-md tracking-wider ${getStatusColor(
                    species.conservationStatus
                  )}`}
                >
                  ENDANGERED
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">
                {species.commonName}
              </h1>
              <h2 className="text-2xl text-slate-500 italic font-serif mb-6">
                {species.scientificName}
              </h2>

              <div className="flex flex-wrap gap-4 mb-8">
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all">
                  <ExternalLink size={20} /> View Otolith AI Report
                </button>
                <div className="flex items-center gap-6 px-6 py-3 bg-slate-100 rounded-xl border border-slate-200">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      Total Biomass
                    </span>
                    <span className="block font-bold text-lg text-slate-700">
                      {species.abundance.biomass}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-slate-300"></div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      CPUE
                    </span>
                    <span className="block font-bold text-lg text-slate-700">
                      {species.abundance.cpue}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 text-blue-900 text-sm leading-relaxed">
                {species.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN DATA GRID */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: TAXONOMY & ECOLOGY (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <SectionHeader
                icon={Database}
                title="Classification"
                color="slate"
              />
              <div className="space-y-2">
                {Object.entries(species.classification).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="capitalize text-xs font-bold text-slate-400">
                      {key}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <SectionHeader
                icon={Map}
                title="Ecological Profile"
                color="emerald"
              />
              <TraitRow label="Habitat" value={species.ecology.habitat} />
              <TraitRow label="Diet" value={species.ecology.diet} />
              <TraitRow label="Range" value={species.ecology.range} />
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <SectionHeader
                icon={Anchor}
                title="Latest Sighting"
                color="cyan"
              />
              <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Location
                </div>
                <div className="font-mono text-xs text-slate-700 break-words">
                  {species.latestObservation.location}
                </div>
              </div>
              <TraitRow label="Date" value={species.latestObservation.date} />
              <TraitRow label="Depth" value={species.latestObservation.depth} />
              <div className="mt-4 text-[10px] text-right text-slate-400">
                Source: {species.latestObservation.source}
              </div>
            </div>
          </div>

          {/* RIGHT: LIFE HISTORY & ABUNDANCE (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* System Intelligence Panel */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                  <Microscope className="text-indigo-500" /> System Intelligence
                </h3>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                  Live Data
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-2xl border ${
                    species.aiAnalysis.otolithAvailable
                      ? "bg-green-50 border-green-200"
                      : "bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-500 mb-1">
                    Otolith Data
                  </div>
                  <div
                    className={`font-bold ${
                      species.aiAnalysis.otolithAvailable
                        ? "text-green-700"
                        : "text-slate-400"
                    }`}
                  >
                    {species.aiAnalysis.otolithAvailable
                      ? "AVAILABLE"
                      : "PENDING"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl border bg-blue-50 border-blue-200">
                  <div className="text-xs font-bold text-slate-500 mb-1">
                    eDNA Record
                  </div>
                  <div className="font-bold text-blue-700">
                    {species.aiAnalysis.ednaAvailable ? "SEQUENCED" : "NO DATA"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200">
                  <div className="text-xs font-bold text-slate-500 mb-1">
                    AI Samples
                  </div>
                  <div className="font-bold text-slate-700">
                    {species.aiAnalysis.imagesAnalyzed} Analyzed
                  </div>
                </div>
              </div>
            </div>

            {/* --- MASSIVE DATA GRID (Grouped by Scientific Domain) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Abundance Data */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <SectionHeader
                  icon={Fish}
                  title="Abundance & Dynamics"
                  color="amber"
                />
                <TraitRow
                  label="Total Count"
                  value={species.abundance.totalCount}
                />
                <TraitRow label="CPUE" value={species.abundance.cpue} />
                <TraitRow label="Density" value={species.abundance.density} />
                <TraitRow
                  label="Juv/Adult Ratio"
                  value={species.abundance.juvAdultRatio}
                />
                <TraitRow
                  label="Temporal Trend"
                  value={species.abundance.temporalTrend}
                />
                <TraitRow
                  label="Spatial Trend"
                  value={species.abundance.spatialTrend}
                />
                <TraitRow
                  label="Recruitment"
                  value={species.abundance.recruitmentLevels}
                />
              </div>

              {/* 2. Growth Traits */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <SectionHeader
                  icon={Ruler}
                  title="Growth Traits"
                  color="blue"
                />
                <TraitRow
                  label="Max Size (L∞)"
                  value={species.growthTraits.maxSize}
                />
                <TraitRow
                  label="Max Weight"
                  value={species.growthTraits.maxWeight}
                />
                <TraitRow label="Max Age" value={species.growthTraits.maxAge} />
                <TraitRow
                  label="Age at Maturity"
                  value={species.growthTraits.ageAtMaturity}
                />
                <TraitRow
                  label="Growth Rate"
                  value={species.growthTraits.growthRate}
                />
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                  Params: {species.growthTraits.vonBertalanffyParams}
                </div>
              </div>

              {/* 3. Reproductive Traits */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <SectionHeader
                  icon={Egg}
                  title="Reproductive Traits"
                  color="rose"
                />
                <TraitRow
                  label="Fecundity"
                  value={species.reproductiveTraits.fecundity}
                />
                <TraitRow
                  label="Spawning Season"
                  value={species.reproductiveTraits.spawningSeason}
                />
                <TraitRow
                  label="Spawning Freq."
                  value={species.reproductiveTraits.spawningFrequency}
                />
                <TraitRow
                  label="Size at Maturity"
                  value={species.reproductiveTraits.sizeAtMaturity}
                />
                <TraitRow
                  label="Sex Ratio"
                  value={species.reproductiveTraits.sexRatio}
                />
                <TraitRow
                  label="Egg Diameter"
                  value={species.reproductiveTraits.eggDiameter}
                />
              </div>

              {/* 4. Survival & Feeding */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <SectionHeader
                  icon={HeartPulse}
                  title="Survival & Feeding"
                  color="purple"
                />
                <TraitRow
                  label="Mortality Rate"
                  value={species.survivalTraits.mortalityRate}
                />
                <TraitRow
                  label="Longevity"
                  value={species.survivalTraits.longevity}
                />
                <TraitRow
                  label="Larval Survival"
                  value={species.survivalTraits.larvalSurvivalRate}
                />
                <TraitRow
                  label="Diet Composition"
                  value={species.feedingEcology.dietComposition}
                />
                <TraitRow
                  label="Trophic Level"
                  value={species.feedingEcology.trophicLevel}
                />
              </div>

              {/* 5. Development & Behavior */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <SectionHeader
                  icon={Brain}
                  title="Behavior & Development"
                  color="teal"
                />
                <TraitRow
                  label="Larval Duration"
                  value={species.developmentalTraits.larvalDuration}
                />
                <TraitRow
                  label="Metamorphosis"
                  value={species.developmentalTraits.metamorphosisTiming}
                />
                <TraitRow
                  label="Migration"
                  value={species.behaviouralTraits.migrationPatterns}
                />
                <TraitRow
                  label="Habitat Pref"
                  value={species.behaviouralTraits.habitatPreference}
                />
              </div>

              {/* 6. Physiology */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <SectionHeader
                  icon={Thermometer}
                  title="Physiology"
                  color="red"
                />
                <TraitRow
                  label="Thermal Tol."
                  value={species.physiologicalTraits.thermalTolerance}
                />
                <TraitRow
                  label="Salinity Tol."
                  value={species.physiologicalTraits.salinityTolerance}
                />
                <TraitRow
                  label="Metabolic Rate"
                  value={species.physiologicalTraits.metabolicTraits}
                />
                <TraitRow
                  label="O2 Efficiency"
                  value={species.physiologicalTraits.oxygenUseEfficiency}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. TABBED FOOTER (Map, Datasets, eDNA) */}
        <div className="mt-12 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {["map", "datasets", "edna"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "border-cyan-500 text-cyan-600 bg-cyan-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab === "map"
                  ? "Geographic Distribution"
                  : tab === "datasets"
                  ? `Associated Datasets (${species.datasets.length})`
                  : "eDNA History"}
              </button>
            ))}
          </div>

          <div className="p-8 min-h-[300px] bg-slate-50/30">
            {activeTab === "map" && (
              <div className="flex items-center justify-center h-80 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400">
                <div className="text-center">
                  <Map size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Interactive Distribution Map</p>
                  <p className="text-xs mt-1">
                    Showing range for {species.scientificName}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "datasets" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {species.datasets.map((ds, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Database size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">
                          {ds.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Authored by {ds.author} • {ds.date}
                        </div>
                      </div>
                    </div>
                    <ExternalLink
                      size={18}
                      className="text-slate-300 group-hover:text-cyan-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "edna" && (
              <div className="space-y-3">
                {species.ednaHistory.map((rec, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <Dna size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          Sequence Match: {rec.match}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Region: {rec.region} • {rec.date}
                        </div>
                      </div>
                    </div>
                    <span className="px-4 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeciesDetail;

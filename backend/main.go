package main

import (
	"bufio"
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

// --- Structs ---

type Species struct {
	ID                  int      `json:"id"`
	VernacularName      string   `json:"vernacular_name"`
	ScientificName      string   `json:"scientific_name"`
	ImageURLs           []string `json:"image_urls"`
	Kingdom             string   `json:"kingdom"`
	Phylum              string   `json:"phylum"`
	Class               string   `json:"class"`
	Order               string   `json:"order"`
	Family              string   `json:"family"`
	Genus               string   `json:"genus"`
	Species             string   `json:"species"`
	HabitatType         string   `json:"habitat_type"`
	Diet                string   `json:"diet"`
	ReportedRegions     []string `json:"reported_regions"`
	MaxLengthCm         float64  `json:"max_length_cm"`
	MaxWeightKg         float64  `json:"max_weight_kg"`
	MaxAgeYears         float64  `json:"max_age_years"`
	AgeOfMaturityYears  float64  `json:"age_of_maturity_years"`
	DepthRangeMin       float64  `json:"depth_range_min"`
	DepthRangeMax       float64  `json:"depth_range_max"`
	ConservationStatus  string   `json:"conservation_status"`
	Fecundity           string   `json:"fecundity"`
	SpawningSeason      string   `json:"spawning_season"`
	MaturitySize        float64  `json:"maturity_size"`
	SexRatio            string   `json:"sex_ratio"`
	Recruitment         string   `json:"recruitment"`
	MortalityRate       float64  `json:"mortality_rate"`
	Longevity           float64  `json:"longevity"`
	DietComposition     string   `json:"diet_composition"`
	TrophicLevel        float64  `json:"trophic_level"`
	LarvalSurvival      float64  `json:"larval_survival"`
	LarvalDuration      string   `json:"larval_duration"`
	MetamorphosisTiming string   `json:"metamorphosis_timing"`
	MigrationPatterns   string   `json:"migration_patterns"`
	HabitatPreference   string   `json:"habitat_preference"`
	ThermalTolerance    string   `json:"thermal_tolerance"`
	SalinityTolerance   string   `json:"salinity_tolerance"`
	MetabolicRate       float64  `json:"metabolic_rate"`
	O2Efficiency        float64  `json:"o2_efficiency"`
}

type Otolith struct {
	ID             int     `json:"id"`
	OtolithID      string  `json:"otolith_id"`
	EstimatedAge   float64 `json:"estimated_age"`
	GrowthRate     float64 `json:"growth_rate"`
	RingCount      int     `json:"ring_count"`
	Area           float64 `json:"area"`
	Perimeter      float64 `json:"perimeter"`
	AspectRatio    float64 `json:"aspect_ratio"`
	Circularity    float64 `json:"circularity"`
	Roundness      float64 `json:"roundness"`
	VernacularName string  `json:"vernacular_name"`
	SpeciesID      int     `json:"species_id"`
}

type LatestSighting struct {
	Date       string  `json:"date"`
	Location   string  `json:"location"`
	WaterDepth float64 `json:"water_depth"`
	RecordedBy string  `json:"recorded_by"`
}

type BlastResult struct {
	QueryID      string  `json:"query_id"`
	SubjectID    string  `json:"subject_id"`
	Identity     float64 `json:"identity"`
	AlignmentLen int     `json:"alignment_length"`
	Mismatches   int     `json:"mismatches"`
	GapOpens     int     `json:"gap_opens"`
	QueryStart   int     `json:"query_start"`
	QueryEnd     int     `json:"query_end"`
	SubjectStart int     `json:"subject_start"`
	SubjectEnd   int     `json:"subject_end"`
	Evalue       float64 `json:"evalue"`
	BitScore     float64 `json:"bit_score"`
}

type OceanographicParameter struct {
	ID                        int     `json:"id"`
	EventDate                 string  `json:"event_date"`
	Region                    string  `json:"region"`
	PHLevel                   float64 `json:"ph_level"`
	DissolvedOxygen           float64 `json:"dissolved_oxygen"`
	CO2Concentration          float64 `json:"co2_concentration"`
	TotalAlkalinity           float64 `json:"total_alkalinity"`
	Phytoplankton             float64 `json:"phytoplankton"`
	Zooplankton               float64 `json:"zooplankton"`
	ChlorophyllA              float64 `json:"chlorophyll_a"`
	PZRatio                   float64 `json:"pz_ratio"`
	SST                       float64 `json:"sst"`
	Salinity                  float64 `json:"salinity"`
	MinimumDepth              float64 `json:"minimum_depth"`
	CurrentVelocity           float64 `json:"current_velocity"`
	WaveHeight                float64 `json:"wave_height"`
	ThermoclineDepth          float64 `json:"thermocline_depth"`
	UpwellingIntensity        float64 `json:"upwelling_intensity"`
	MonsoonIntensity          float64 `json:"monsoon_intensity"`
	SSTAnomaly                float64 `json:"sst_anomaly"`
	ElNinoIndex               float64 `json:"el_nino_index"`
	Ammonium                  float64 `json:"ammonium"`
	Nitrate                   float64 `json:"nitrate"`
	Phosphate                 float64 `json:"phosphate"`
	Silicate                  float64 `json:"silicate"`
	NPRatio                   float64 `json:"np_ratio"`
	PlasticDebris             float64 `json:"plastic_debris"`
	OilContamination          float64 `json:"oil_contamination"`
	HeavyMetals               float64 `json:"heavy_metals"`
	Pesticides                float64 `json:"pesticides"`
}

type BiodiversityMetric struct {
	Year                int     `json:"year"`
	Month               int     `json:"month"`
	Region              string  `json:"region"`
	SpeciesRichness     float64 `json:"species_richness"`
	EstimatedRichness   float64 `json:"estimated_richness"`
	ShannonIndex        float64 `json:"shannon_index"`
	SimpsonIndex        float64 `json:"simpson_index"`
	Evenness            float64 `json:"evenness"`
	FunctionalDiversity float64 `json:"functional_diversity"`
	TaxonomicDiversity  float64 `json:"taxonomic_diversity"`
}

type AbundanceData struct {
	EventDate           string  `json:"event_date"`
	TotalAbundance      float64 `json:"total_abundance"`
	JuvenileAdultRatio  float64 `json:"juvenile_adult_ratio"`
	JuvenileAbundance   float64 `json:"juvenile_abundance"`
	AdultAbundance      float64 `json:"adult_abundance"`
}

// --- Main & Routes ---

func main() {
	var err error
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "host=localhost user=postgres password=paradoxxDB2025 dbname=postgres sslmode=disable"
	}

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	for i := 0; i < 10; i++ {
		err = db.Ping()
		if err == nil {
			break
		}
		log.Println("Waiting for database...")
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatal("Could not connect to database:", err)
	}

	http.HandleFunc("/api/filters/classes", getClasses)
	http.HandleFunc("/api/filters/regions", getRegions)
	http.HandleFunc("/api/filters/conservation-status", getConservationStatuses)
	http.HandleFunc("/api/species", getSpecies)
	http.HandleFunc("/api/species/", getSpeciesDetail)
	http.HandleFunc("/api/otoliths", getOtoliths)
	http.HandleFunc("/api/latest-sighting/", getLatestSighting)
	http.HandleFunc("/api/blast", handleBlast)
	http.HandleFunc("/api/oceanographic/regions", getOceanographicRegions)
	http.HandleFunc("/api/oceanographic/parameters", getOceanographicParameters)
	http.HandleFunc("/api/oceanographic/environmental-health", getEnvironmentalHealth)
	http.HandleFunc("/api/biodiversity/metrics", getBiodiversityMetrics)
	http.HandleFunc("/api/marine-trends/species-list", getSpeciesList)
	http.HandleFunc("/api/marine-trends/abundance", getAbundanceData)

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(http.DefaultServeMux)))
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// --- Handlers ---

func getClasses(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT DISTINCT class FROM species_data WHERE class IS NOT NULL ORDER BY class")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var classes []string
	for rows.Next() {
		var class string
		if err := rows.Scan(&class); err != nil {
			continue
		}
		classes = append(classes, class)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(classes)
}

func getRegions(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT DISTINCT region FROM occurrence_data WHERE region IS NOT NULL ORDER BY region")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var regions []string
	for rows.Next() {
		var region string
		if err := rows.Scan(&region); err != nil {
			continue
		}
		regions = append(regions, region)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(regions)
}

func getConservationStatuses(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT DISTINCT conservation_status FROM species_data WHERE conservation_status IS NOT NULL ORDER BY conservation_status")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var statuses []string
	for rows.Next() {
		var status string
		if err := rows.Scan(&status); err != nil {
			continue
		}
		statuses = append(statuses, status)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(statuses)
}

func getSpecies(w http.ResponseWriter, r *http.Request) {
	selectFields := `
		s.id, 
		COALESCE(s.vernacularname, ''), 
		COALESCE(s.scientific_name, ''), 
		s.image_urls, 
		COALESCE(s.kingdom, ''), 
		COALESCE(s.phylum, ''), 
		COALESCE(s.class, ''), 
		COALESCE(s._order, ''), 
		COALESCE(s.family, ''), 
		COALESCE(s.genus, ''), 
		COALESCE(s.species, ''), 
		COALESCE(s.habitat_type, ''), 
		COALESCE(s.diet, ''), 
		s.reported_regions, 
		COALESCE(s.max_length_cm, 0), 
		COALESCE(s.max_weight_kg, 0),
		COALESCE(s.max_age_years, 0),
		COALESCE(s.age_of_maturity_years, 0), 
		COALESCE(s.depth_range_min, 0), 
		COALESCE(s.depth_range_max, 0), 
		COALESCE(s.conservation_status, 'Unknown'),
		COALESCE(s.fecundity, ''),
		COALESCE(s.spawning_season, ''),
		COALESCE(s.maturity_size, 0),
		COALESCE(s.sex_ratio, ''),
		COALESCE(s.recruitment, ''),
		COALESCE(s.mortality_rate, 0),
		COALESCE(s.longevity, 0),
		COALESCE(s.diet_composition, ''),
		COALESCE(s.trophic_level, 0),
		COALESCE(s.larval_survival, 0),
		COALESCE(s.larval_duration, ''),
		COALESCE(s.metamorphosis_timing, ''),
		COALESCE(s.migration_patterns, ''),
		COALESCE(s.habitat_preference, ''),
		COALESCE(s.thermal_tolerance, ''),
		COALESCE(s.salinity_tolerance, ''),
		COALESCE(s.metabolic_rate, 0),
		COALESCE(s.o2_efficiency, 0)`

	baseQuery := "SELECT DISTINCT " + selectFields + " FROM species_data s"
	joinClause := ""
	whereClauses := []string{"1=1"}
	args := []interface{}{}
	argCount := 1

	// Region Filter
	if region := r.URL.Query().Get("region"); region != "" {
		joinClause = " INNER JOIN occurrence_data o ON s.id = o.species_id"
		whereClauses = append(whereClauses, "o.region = $"+strconv.Itoa(argCount))
		args = append(args, region)
		argCount++
	}

	// Time Filter - FIXED: Now using parameterized query
	if timeFilter := r.URL.Query().Get("time"); timeFilter != "" {
		if joinClause == "" {
			joinClause = " INNER JOIN occurrence_data o ON s.id = o.species_id"
		}

		now := time.Now()
		var dateStr string
		switch timeFilter {
		case "24h":
			dateStr = now.Add(-24 * time.Hour).Format("2006-01-02")
		case "7d":
			dateStr = now.AddDate(0, 0, -7).Format("2006-01-02")
		case "1m":
			dateStr = now.AddDate(0, -1, 0).Format("2006-01-02")
		case "1y":
			dateStr = now.AddDate(-1, 0, 0).Format("2006-01-02")
		case "5y":
			dateStr = now.AddDate(-5, 0, 0).Format("2006-01-02")
		}

		if dateStr != "" {
			whereClauses = append(whereClauses, "o.eventdate >= $"+strconv.Itoa(argCount))
			args = append(args, dateStr)
			argCount++
		}
	}

	// Class Filter
	if class := r.URL.Query().Get("class"); class != "" {
		whereClauses = append(whereClauses, "s.class = $"+strconv.Itoa(argCount))
		args = append(args, class)
		argCount++
	}

	// Conservation Status Filter
	if status := r.URL.Query().Get("conservation_status"); status != "" {
		whereClauses = append(whereClauses, "s.conservation_status = $"+strconv.Itoa(argCount))
		args = append(args, status)
		argCount++
	}

	// Depth Range Filters
	if minDepth := r.URL.Query().Get("min_depth"); minDepth != "" {
		whereClauses = append(whereClauses, "s.depth_range_min >= $"+strconv.Itoa(argCount))
		args = append(args, minDepth)
		argCount++
	}

	if maxDepth := r.URL.Query().Get("max_depth"); maxDepth != "" {
		whereClauses = append(whereClauses, "s.depth_range_max <= $"+strconv.Itoa(argCount))
		args = append(args, maxDepth)
		argCount++
	}

	// Search Filter
	if search := r.URL.Query().Get("search"); search != "" {
		whereClauses = append(whereClauses, "(s.vernacularname ILIKE $"+strconv.Itoa(argCount)+" OR s.scientific_name ILIKE $"+strconv.Itoa(argCount)+")")
		args = append(args, "%"+search+"%")
		argCount++
	}

	finalQuery := baseQuery + joinClause + " WHERE " + strings.Join(whereClauses, " AND ")

	rows, err := db.Query(finalQuery, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var speciesList []Species
	for rows.Next() {
		var s Species
		var imageURLs, reportedRegions sql.NullString

		err := rows.Scan(&s.ID, &s.VernacularName, &s.ScientificName, &imageURLs, &s.Kingdom, &s.Phylum, &s.Class, &s.Order, &s.Family, &s.Genus, &s.Species, &s.HabitatType, &s.Diet, &reportedRegions, &s.MaxLengthCm, &s.MaxWeightKg, &s.MaxAgeYears, &s.AgeOfMaturityYears, &s.DepthRangeMin, &s.DepthRangeMax, &s.ConservationStatus, &s.Fecundity, &s.SpawningSeason, &s.MaturitySize, &s.SexRatio, &s.Recruitment, &s.MortalityRate, &s.Longevity, &s.DietComposition, &s.TrophicLevel, &s.LarvalSurvival, &s.LarvalDuration, &s.MetamorphosisTiming, &s.MigrationPatterns, &s.HabitatPreference, &s.ThermalTolerance, &s.SalinityTolerance, &s.MetabolicRate, &s.O2Efficiency)

		if err != nil {
			continue
		}

		if imageURLs.Valid && imageURLs.String != "" {
			s.ImageURLs = strings.Split(strings.Trim(imageURLs.String, "{}"), ",")
		}
		if reportedRegions.Valid && reportedRegions.String != "" {
			s.ReportedRegions = strings.Split(strings.Trim(reportedRegions.String, "{}"), ",")
		}
		speciesList = append(speciesList, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(speciesList)
}

func getSpeciesDetail(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/species/")

	var s Species
	var imageURLs, reportedRegions sql.NullString

	query := `SELECT 
		id, 
		COALESCE(vernacularname, ''), 
		COALESCE(scientific_name, ''), 
		image_urls, 
		COALESCE(kingdom, ''), 
		COALESCE(phylum, ''), 
		COALESCE(class, ''), 
		COALESCE(_order, ''), 
		COALESCE(family, ''), 
		COALESCE(genus, ''), 
		COALESCE(species, ''), 
		COALESCE(habitat_type, ''), 
		COALESCE(diet, ''), 
		reported_regions, 
		COALESCE(max_length_cm, 0), 
		COALESCE(max_weight_kg, 0),
		COALESCE(max_age_years, 0),
		COALESCE(age_of_maturity_years, 0), 
		COALESCE(depth_range_min, 0), 
		COALESCE(depth_range_max, 0), 
		COALESCE(conservation_status, 'Unknown'),
		COALESCE(fecundity, ''),
		COALESCE(spawning_season, ''),
		COALESCE(maturity_size, 0),
		COALESCE(sex_ratio, ''),
		COALESCE(recruitment, ''),
		COALESCE(mortality_rate, 0),
		COALESCE(longevity, 0),
		COALESCE(diet_composition, ''),
		COALESCE(trophic_level, 0),
		COALESCE(larval_survival, 0),
		COALESCE(larval_duration, ''),
		COALESCE(metamorphosis_timing, ''),
		COALESCE(migration_patterns, ''),
		COALESCE(habitat_preference, ''),
		COALESCE(thermal_tolerance, ''),
		COALESCE(salinity_tolerance, ''),
		COALESCE(metabolic_rate, 0),
		COALESCE(o2_efficiency, 0)
		FROM species_data WHERE id = $1`

	err := db.QueryRow(query, id).Scan(&s.ID, &s.VernacularName, &s.ScientificName, &imageURLs, &s.Kingdom, &s.Phylum, &s.Class, &s.Order, &s.Family, &s.Genus, &s.Species, &s.HabitatType, &s.Diet, &reportedRegions, &s.MaxLengthCm, &s.MaxWeightKg, &s.MaxAgeYears, &s.AgeOfMaturityYears, &s.DepthRangeMin, &s.DepthRangeMax, &s.ConservationStatus, &s.Fecundity, &s.SpawningSeason, &s.MaturitySize, &s.SexRatio, &s.Recruitment, &s.MortalityRate, &s.Longevity, &s.DietComposition, &s.TrophicLevel, &s.LarvalSurvival, &s.LarvalDuration, &s.MetamorphosisTiming, &s.MigrationPatterns, &s.HabitatPreference, &s.ThermalTolerance, &s.SalinityTolerance, &s.MetabolicRate, &s.O2Efficiency)

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if imageURLs.Valid && imageURLs.String != "" {
		s.ImageURLs = strings.Split(strings.Trim(imageURLs.String, "{}"), ",")
	}
	if reportedRegions.Valid && reportedRegions.String != "" {
		s.ReportedRegions = strings.Split(strings.Trim(reportedRegions.String, "{}"), ",")
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

func getOtoliths(w http.ResponseWriter, r *http.Request) {
	query := "SELECT o.id, o.otolith_id, o.estimated_age, o.growth_rate, o.ring_count, o.area, o.perimeter, o.aspect_ratio, o.circularity, o.roundness, o.species_id, COALESCE(s.vernacularname, 'Unknown') FROM otolith_metadata o LEFT JOIN species_data s ON o.species_id = s.id"

	rows, err := db.Query(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var otoliths []Otolith
	for rows.Next() {
		var o Otolith
		err := rows.Scan(&o.ID, &o.OtolithID, &o.EstimatedAge, &o.GrowthRate, &o.RingCount, &o.Area, &o.Perimeter, &o.AspectRatio, &o.Circularity, &o.Roundness, &o.SpeciesID, &o.VernacularName)
		if err != nil {
			continue
		}
		otoliths = append(otoliths, o)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(otoliths)
}

func getLatestSighting(w http.ResponseWriter, r *http.Request) {
	speciesID := strings.TrimPrefix(r.URL.Path, "/api/latest-sighting/")
	var sighting LatestSighting

	err := db.QueryRow("SELECT eventdate, region, COALESCE(waterdepth_m, 0), recordedby FROM occurrence_data WHERE species_id = $1 ORDER BY eventdate DESC LIMIT 1", speciesID).Scan(&sighting.Date, &sighting.Location, &sighting.WaterDepth, &sighting.RecordedBy)

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sighting)
}

// --- NCBI External API Handlers ---

func handleBlast(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}
	file, _, err := r.FormFile("fasta")
	if err != nil {
		http.Error(w, "Failed to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	sequence := extractSequence(string(fileBytes))
	if sequence == "" {
		http.Error(w, "No valid sequence found in FASTA file", http.StatusBadRequest)
		return
	}

	rid, err := submitToNCBI(sequence)
	if err != nil {
		http.Error(w, "Failed to submit to NCBI: "+err.Error(), http.StatusBadGateway)
		return
	}

	status := "WAITING"
	maxAttempts := 60
	attempts := 0

	for status == "WAITING" && attempts < maxAttempts {
		time.Sleep(5 * time.Second)
		attempts++
		status, err = checkNCBIStatus(rid)
		if err != nil {
			http.Error(w, "Error checking status", http.StatusBadGateway)
			return
		}
		if status == "FAILED" || status == "UNKNOWN" {
			http.Error(w, "BLAST search failed", http.StatusBadGateway)
			return
		}
	}

	if status == "WAITING" {
		http.Error(w, "BLAST search timed out", http.StatusRequestTimeout)
		return
	}

	results, err := getNCBIResults(rid)
	if err != nil {
		http.Error(w, "Failed to retrieve results", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func extractSequence(fasta string) string {
	var sequence bytes.Buffer
	scanner := bufio.NewScanner(strings.NewReader(fasta))

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, ">") {
			continue
		}
		sequence.WriteString(line)
	}
	return sequence.String()
}

// --- Oceanographic Handlers ---

func getOceanographicRegions(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT DISTINCT region FROM oceanographic_parameters WHERE region IS NOT NULL ORDER BY region")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var regions []string
	for rows.Next() {
		var region string
		if err := rows.Scan(&region); err != nil {
			continue
		}
		regions = append(regions, region)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(regions)
}

func getOceanographicParameters(w http.ResponseWriter, r *http.Request) {
	query := `SELECT 
		id,
		eventdate,
		COALESCE(region, ''),
		COALESCE(phlevel, 0),
		COALESCE(dissolvedoxygen_milligramsperlitre, 0),
		COALESCE(co2_microatm, 0),
		COALESCE(alkalinity_micromolperkilogram, 0),
		COALESCE(phytoplankton_cellsperlitre, 0),
		COALESCE(zooplankton_cellsperlitre, 0),
		COALESCE(chlorophyll_a_microgramperlitre, 0),
		COALESCE(pz_ratio, 0),
		COALESCE(sst_degreecelsius, 0),
		COALESCE(salinity_psu, 0),
		COALESCE(minimumdepthinmeters, 0),
		COALESCE(currentvelocity_meterspersecond, 0),
		COALESCE(waveheight_meters, 0),
		COALESCE(thermoclinedepth_meters, 0),
		COALESCE(upwellingintensity_centimeterspersecond, 0),
		COALESCE(monsoonintensity_millimetersperday, 0),
		COALESCE(sealevelanomalies_meters, 0),
		COALESCE(elninoindex_oni, 0),
		COALESCE(ammonium_micromolperlitre, 0),
		COALESCE(nitrate_micromolperlitre, 0),
		COALESCE(phosphate_micromolperlitre, 0),
		COALESCE(silicate_micromolperlitre, 0),
		COALESCE(np_ratio, 0),
		COALESCE(plasticdebris_pcsperkilometersquared, 0),
		COALESCE(oilcontamination_microgramsperlitre, 0),
		COALESCE(heavymetals_nanogramsperlitre, 0),
		COALESCE(pesticides_nanogramsperlitre, 0)
		FROM oceanographic_parameters WHERE 1=1`

	args := []interface{}{}
	argCount := 1

	// Region filter
	if region := r.URL.Query().Get("region"); region != "" {
		query += " AND region = $" + strconv.Itoa(argCount)
		args = append(args, region)
		argCount++
	}

	// Date range filters
	if startDate := r.URL.Query().Get("start_date"); startDate != "" {
		query += " AND eventdate >= $" + strconv.Itoa(argCount)
		args = append(args, startDate)
		argCount++
	}

	if endDate := r.URL.Query().Get("end_date"); endDate != "" {
		query += " AND eventdate <= $" + strconv.Itoa(argCount)
		args = append(args, endDate)
		argCount++
	}

	// Category filter
	category := r.URL.Query().Get("category")

	query += " ORDER BY eventdate"

	rows, err := db.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var parameters []OceanographicParameter
	for rows.Next() {
		var p OceanographicParameter
		err := rows.Scan(
			&p.ID, &p.EventDate, &p.Region,
			&p.PHLevel, &p.DissolvedOxygen, &p.CO2Concentration, &p.TotalAlkalinity,
			&p.Phytoplankton, &p.Zooplankton, &p.ChlorophyllA, &p.PZRatio,
			&p.SST, &p.Salinity, &p.MinimumDepth, &p.CurrentVelocity, &p.WaveHeight,
			&p.ThermoclineDepth, &p.UpwellingIntensity, &p.MonsoonIntensity,
			&p.SSTAnomaly, &p.ElNinoIndex, &p.Ammonium,
			&p.Nitrate, &p.Phosphate, &p.Silicate, &p.NPRatio,
			&p.PlasticDebris, &p.OilContamination, &p.HeavyMetals, &p.Pesticides,
		)
		if err != nil {
			continue
		}

		// Filter by category if specified
		if category != "" {
			filteredParam := filterByCategory(p, category)
			parameters = append(parameters, filteredParam)
		} else {
			parameters = append(parameters, p)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(parameters)
}

func filterByCategory(p OceanographicParameter, category string) OceanographicParameter {
	filtered := OceanographicParameter{
		ID:        p.ID,
		EventDate: p.EventDate,
		Region:    p.Region,
	}

	switch strings.ToLower(category) {
	case "biochemical":
		filtered.PHLevel = p.PHLevel
		filtered.DissolvedOxygen = p.DissolvedOxygen
		filtered.CO2Concentration = p.CO2Concentration
		filtered.TotalAlkalinity = p.TotalAlkalinity
	case "ecological":
		filtered.Phytoplankton = p.Phytoplankton
		filtered.Zooplankton = p.Zooplankton
		filtered.ChlorophyllA = p.ChlorophyllA
		filtered.PZRatio = p.PZRatio
	case "human impact":
		filtered.PlasticDebris = p.PlasticDebris
		filtered.OilContamination = p.OilContamination
		filtered.HeavyMetals = p.HeavyMetals
		filtered.Pesticides = p.Pesticides
	case "physical oceanography":
		filtered.SST = p.SST
		filtered.Salinity = p.Salinity
		filtered.MinimumDepth = p.MinimumDepth
		filtered.CurrentVelocity = p.CurrentVelocity
		filtered.WaveHeight = p.WaveHeight
		filtered.ThermoclineDepth = p.ThermoclineDepth
		filtered.UpwellingIntensity = p.UpwellingIntensity
		filtered.MonsoonIntensity = p.MonsoonIntensity
	case "climate change":
		filtered.SSTAnomaly = p.SSTAnomaly
		filtered.ElNinoIndex = p.ElNinoIndex
		filtered.Ammonium = p.Ammonium
	case "nutrient dynamics":
		filtered.Nitrate = p.Nitrate
		filtered.Phosphate = p.Phosphate
		filtered.Silicate = p.Silicate
		filtered.NPRatio = p.NPRatio
	default:
		return p
	}

	return filtered
}

func getEnvironmentalHealth(w http.ResponseWriter, r *http.Request) {
	query := `SELECT 
		eventdate,
		COALESCE(plasticdebris_pcsperkilometersquared, 0),
		COALESCE(oilcontamination_microgramsperlitre, 0),
		COALESCE(heavymetals_nanogramsperlitre, 0),
		COALESCE(pesticides_nanogramsperlitre, 0)
		FROM oceanographic_parameters`

	args := []interface{}{}
	argCount := 1
	whereClauses := []string{}

	if region := r.URL.Query().Get("region"); region != "" {
		whereClauses = append(whereClauses, "region = $"+strconv.Itoa(argCount))
		args = append(args, region)
		argCount++
	}

	if len(whereClauses) > 0 {
		query += " WHERE " + strings.Join(whereClauses, " AND ")
	}

	query += " ORDER BY eventdate DESC LIMIT 1"

	var eventDate string
	var plasticDebris, oilContamination, heavyMetals, pesticides float64

	err := db.QueryRow(query, args...).Scan(&eventDate, &plasticDebris, &oilContamination, &heavyMetals, &pesticides)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	result := map[string]interface{}{
		"event_date":        eventDate,
		"plastic_debris":    plasticDebris,
		"oil_contamination": oilContamination,
		"heavy_metals":      heavyMetals,
		"pesticides":        pesticides,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// --- Biodiversity Handlers ---

func getBiodiversityMetrics(w http.ResponseWriter, r *http.Request) {
	query := `SELECT 
		year,
		month,
		COALESCE(region, ''),
		COALESCE(species_richness, 0),
		COALESCE(estimated_richness, 0),
		COALESCE(shannon_index, 0),
		COALESCE(simpson_index, 0),
		COALESCE(evenness, 0),
		COALESCE(functional_diversity, 0),
		COALESCE(taxonomic_diversity, 0)
		FROM biodiversity_metrics WHERE 1=1`

	args := []interface{}{}
	argCount := 1

	if region := r.URL.Query().Get("region"); region != "" {
		query += " AND region = $" + strconv.Itoa(argCount)
		args = append(args, region)
		argCount++
	}

	if startYear := r.URL.Query().Get("start_year"); startYear != "" {
		query += " AND year >= $" + strconv.Itoa(argCount)
		args = append(args, startYear)
		argCount++
	}

	if endYear := r.URL.Query().Get("end_year"); endYear != "" {
		query += " AND year <= $" + strconv.Itoa(argCount)
		args = append(args, endYear)
		argCount++
	}

	query += " ORDER BY year, month"

	rows, err := db.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var metrics []BiodiversityMetric
	for rows.Next() {
		var m BiodiversityMetric
		err := rows.Scan(&m.Year, &m.Month, &m.Region, &m.SpeciesRichness, &m.EstimatedRichness,
			&m.ShannonIndex, &m.SimpsonIndex, &m.Evenness, &m.FunctionalDiversity, &m.TaxonomicDiversity)
		if err != nil {
			continue
		}
		metrics = append(metrics, m)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}

// --- Marine Trends Handlers ---

func getSpeciesList(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT DISTINCT scientific_name FROM species_data WHERE scientific_name IS NOT NULL ORDER BY scientific_name")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var speciesList []string
	for rows.Next() {
		var species string
		if err := rows.Scan(&species); err != nil {
			continue
		}
		speciesList = append(speciesList, species)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(speciesList)
}

func getAbundanceData(w http.ResponseWriter, r *http.Request) {
	query := `SELECT 
		o.eventdate,
		COALESCE(o.total_abundance, 0),
		COALESCE(o.juvenile_adult_ratio, 0),
		COALESCE(o.juvenile_abundance, 0),
		COALESCE(o.adult_abundance, 0)
		FROM occurrence_data o
		INNER JOIN species_data s ON o.species_id = s.id
		WHERE 1=1`

	args := []interface{}{}
	argCount := 1

	if species := r.URL.Query().Get("species"); species != "" {
		query += " AND s.scientific_name = $" + strconv.Itoa(argCount)
		args = append(args, species)
		argCount++
	}

	if region := r.URL.Query().Get("region"); region != "" {
		query += " AND o.region = $" + strconv.Itoa(argCount)
		args = append(args, region)
		argCount++
	}

	if startDate := r.URL.Query().Get("start_date"); startDate != "" {
		query += " AND o.eventdate >= $" + strconv.Itoa(argCount)
		args = append(args, startDate)
		argCount++
	}

	if endDate := r.URL.Query().Get("end_date"); endDate != "" {
		query += " AND o.eventdate <= $" + strconv.Itoa(argCount)
		args = append(args, endDate)
		argCount++
	}

	query += " ORDER BY o.eventdate"

	rows, err := db.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var abundanceData []AbundanceData
	for rows.Next() {
		var a AbundanceData
		err := rows.Scan(&a.EventDate, &a.TotalAbundance, &a.JuvenileAdultRatio, &a.JuvenileAbundance, &a.AdultAbundance)
		if err != nil {
			continue
		}
		abundanceData = append(abundanceData, a)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(abundanceData)
}

func submitToNCBI(sequence string) (string, error) {
	apiURL := "https://blast.ncbi.nlm.nih.gov/Blast.cgi"
	data := url.Values{}
	data.Set("CMD", "Put")
	data.Set("PROGRAM", "blastn")
	data.Set("DATABASE", "nt")
	data.Set("QUERY", sequence)
	data.Set("tool", "FishSpeciesDB")
	data.Set("email", "admin@localhost")

	resp, err := http.PostForm(apiURL, data)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	content := string(body)

	if !strings.Contains(content, "RID =") {
		return "", fmt.Errorf("no RID returned")
	}

	lines := strings.Split(content, "\n")
	for _, line := range lines {
		if strings.Contains(line, "RID =") {
			parts := strings.Split(line, "=")
			if len(parts) > 1 {
				return strings.TrimSpace(parts[1]), nil
			}
		}
	}
	return "", fmt.Errorf("could not parse RID")
}

func checkNCBIStatus(rid string) (string, error) {
	apiURL := fmt.Sprintf("https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_OBJECT=SearchInfo&RID=%s", rid)
	resp, err := http.Get(apiURL)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	content := string(body)

	if strings.Contains(content, "Status=WAITING") {
		return "WAITING", nil
	}
	if strings.Contains(content, "Status=READY") {
		return "READY", nil
	}
	return "FAILED", nil
}

func getNCBIResults(rid string) ([]BlastResult, error) {
	apiURL := fmt.Sprintf("https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_TYPE=Text&ALIGNMENT_VIEW=Tabular&RID=%s", rid)
	resp, err := http.Get(apiURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var results []BlastResult
	scanner := bufio.NewScanner(resp.Body)

	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "#") || strings.TrimSpace(line) == "" {
			continue
		}
		parts := strings.Fields(line)
		if len(parts) < 12 {
			continue
		}

		identity, _ := strconv.ParseFloat(parts[2], 64)
		alignLen, _ := strconv.Atoi(parts[3])
		mismatches, _ := strconv.Atoi(parts[4])
		gapOpens, _ := strconv.Atoi(parts[5])
		qStart, _ := strconv.Atoi(parts[6])
		qEnd, _ := strconv.Atoi(parts[7])
		sStart, _ := strconv.Atoi(parts[8])
		sEnd, _ := strconv.Atoi(parts[9])
		eValue, _ := strconv.ParseFloat(parts[10], 64)
		bitScore, _ := strconv.ParseFloat(parts[11], 64)

		results = append(results, BlastResult{
			QueryID:      parts[0],
			SubjectID:    parts[1],
			Identity:     identity,
			AlignmentLen: alignLen,
			Mismatches:   mismatches,
			GapOpens:     gapOpens,
			QueryStart:   qStart,
			QueryEnd:     qEnd,
			SubjectStart: sStart,
			SubjectEnd:   sEnd,
			Evalue:       eValue,
			BitScore:     bitScore,
		})
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return results, nil
}
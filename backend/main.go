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
	ID                 int      `json:"id"`
	VernacularName     string   `json:"vernacular_name"`
	ScientificName     string   `json:"scientific_name"`
	ImageURLs          []string `json:"image_urls"`
	Kingdom            string   `json:"kingdom"`
	Phylum             string   `json:"phylum"`
	Class              string   `json:"class"`
	Order              string   `json:"order"`
	Family             string   `json:"family"`
	Genus              string   `json:"genus"`
	Species            string   `json:"species"`
	HabitatType        string   `json:"habitat_type"`
	Diet               string   `json:"diet"`
	ReportedRegions    []string `json:"reported_regions"`
	MaxLengthCm        float64  `json:"max_length_cm"`
	MaxWeightKg        float64  `json:"max_weight_kg"`
	AgeOfMaturityYears float64  `json:"age_of_maturity_years"`
	DepthRangeMin      float64  `json:"depth_range_min"`
	DepthRangeMax      float64  `json:"depth_range_max"`
	ConservationStatus string   `json:"conservation_status"`
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
	Date     string  `json:"date"`
	Location string  `json:"location"`
	Depth    float64 `json:"depth"`
	Source   string  `json:"source"`
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

// --- Main & Routes ---

func main() {
	var err error
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		// Default fallback for local testing without Docker
		connStr = "host=localhost user=postgres password=paradoxxDB2025 dbname=postgres sslmode=disable"
	}

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Wait for DB to be ready (useful in Docker)
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
	http.HandleFunc("/api/species", getSpecies)
	http.HandleFunc("/api/species/", getSpeciesDetail)
	http.HandleFunc("/api/otoliths", getOtoliths)
	http.HandleFunc("/api/latest-sighting/", getLatestSighting)
	http.HandleFunc("/api/blast", handleBlast)

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(http.DefaultServeMux)))
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
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
	json.NewEncoder(w).Encode(regions)
}

func getSpecies(w http.ResponseWriter, r *http.Request) {
	// FIXED: Using COALESCE to prevent crashes on NULL values in the database
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
		COALESCE(age_of_maturity_years, 0), 
		COALESCE(depth_range_min, 0), 
		COALESCE(depth_range_max, 0), 
		COALESCE(conservation_status, 'Unknown') 
		FROM species_data WHERE 1=1`

	args := []interface{}{}
	argCount := 1

	if class := r.URL.Query().Get("class"); class != "" {
		query += " AND class = $" + strconv.Itoa(argCount)
		args = append(args, class)
		argCount++
	}

	if search := r.URL.Query().Get("search"); search != "" {
		query += " AND (vernacularname ILIKE $" + strconv.Itoa(argCount) + " OR scientific_name ILIKE $" + strconv.Itoa(argCount) + ")"
		args = append(args, "%"+search+"%")
		argCount++
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var speciesList []Species
	for rows.Next() {
		var s Species
		var imageURLs, reportedRegions sql.NullString

		err := rows.Scan(&s.ID, &s.VernacularName, &s.ScientificName, &imageURLs, &s.Kingdom, &s.Phylum, &s.Class, &s.Order, &s.Family, &s.Genus, &s.Species, &s.HabitatType, &s.Diet, &reportedRegions, &s.MaxLengthCm, &s.MaxWeightKg, &s.AgeOfMaturityYears, &s.DepthRangeMin, &s.DepthRangeMax, &s.ConservationStatus)

		if err != nil {
			continue // Skip bad rows instead of crashing
		}

		if imageURLs.Valid && imageURLs.String != "" {
			s.ImageURLs = strings.Split(strings.Trim(imageURLs.String, "{}"), ",")
		}
		if reportedRegions.Valid && reportedRegions.String != "" {
			s.ReportedRegions = strings.Split(strings.Trim(reportedRegions.String, "{}"), ",")
		}
		speciesList = append(speciesList, s)
	}
	json.NewEncoder(w).Encode(speciesList)
}

func getSpeciesDetail(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/species/")

	var s Species
	var imageURLs, reportedRegions sql.NullString

	// FIXED: Using COALESCE here as well
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
		COALESCE(age_of_maturity_years, 0), 
		COALESCE(depth_range_min, 0), 
		COALESCE(depth_range_max, 0), 
		COALESCE(conservation_status, 'Unknown') 
		FROM species_data WHERE id = $1`

	err := db.QueryRow(query, id).Scan(&s.ID, &s.VernacularName, &s.ScientificName, &imageURLs, &s.Kingdom, &s.Phylum, &s.Class, &s.Order, &s.Family, &s.Genus, &s.Species, &s.HabitatType, &s.Diet, &reportedRegions, &s.MaxLengthCm, &s.MaxWeightKg, &s.AgeOfMaturityYears, &s.DepthRangeMin, &s.DepthRangeMax, &s.ConservationStatus)

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
	json.NewEncoder(w).Encode(otoliths)
}

func getLatestSighting(w http.ResponseWriter, r *http.Request) {
	speciesID := strings.TrimPrefix(r.URL.Path, "/api/latest-sighting/")
	var sighting LatestSighting
	err := db.QueryRow("SELECT eventdate, region, depth, source FROM occurrence_data WHERE species_id = $1 ORDER BY eventdate DESC LIMIT 1", speciesID).Scan(&sighting.Date, &sighting.Location, &sighting.Depth, &sighting.Source)
	
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(sighting)
}

//NCBI External API

func handleBlast(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 1. Parse File
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
	
	// Extract sequence (skip FASTA header lines starting with '>')
	sequence := extractSequence(string(fileBytes))
	if sequence == "" {
		http.Error(w, "No valid sequence found in FASTA file", http.StatusBadRequest)
		return
	}

	// 2. Submit to NCBI
	rid, err := submitToNCBI(sequence)
	if err != nil {
		http.Error(w, "Failed to submit to NCBI: "+err.Error(), http.StatusBadGateway)
		return
	}

	// 3. Poll for Status (with timeout)
	status := "WAITING"
	maxAttempts := 60 // 5 minutes max (60 * 5 seconds)
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

	// 4. Get Results
	results, err := getNCBIResults(rid)
	if err != nil {
		http.Error(w, "Failed to retrieve results", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// Extract sequence from FASTA format (removes header lines)
func extractSequence(fasta string) string {
	var sequence bytes.Buffer
	scanner := bufio.NewScanner(strings.NewReader(fasta))
	
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, ">") {
			continue // Skip empty lines and headers
		}
		sequence.WriteString(line)
	}
	return sequence.String()
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
			QueryID: parts[0], SubjectID: parts[1], Identity: identity,
			AlignmentLen: alignLen, Mismatches: mismatches, GapOpens: gapOpens,
			QueryStart: qStart, QueryEnd: qEnd, SubjectStart: sStart, SubjectEnd: sEnd,
			Evalue: eValue, BitScore: bitScore,
		})
	}
	
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	
	return results, nil
}
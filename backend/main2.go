package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	_ "github.com/lib/pq"
)

var db *sql.DB

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
	AgeOfMaturityYears  float64  `json:"age_of_maturity_years"`
	DepthRangeMin       float64  `json:"depth_range_min"`
	DepthRangeMax       float64  `json:"depth_range_max"`
	ConservationStatus  string   `json:"conservation_status"`
}

type Otolith struct {
	ID            int     `json:"id"`
	OtolithID     string  `json:"otolith_id"`
	EstimatedAge  float64 `json:"estimated_age"`
	GrowthRate    float64 `json:"growth_rate"`
	RingCount     int     `json:"ring_count"`
	Area          float64 `json:"area"`
	Perimeter     float64 `json:"perimeter"`
	AspectRatio   float64 `json:"aspect_ratio"`
	Circularity   float64 `json:"circularity"`
	Roundness     float64 `json:"roundness"`
	VernacularName string `json:"vernacular_name"`
	SpeciesID     int     `json:"species_id"`
}

type LatestSighting struct {
	Date     string  `json:"date"`
	Location string  `json:"location"`
	Depth    float64 `json:"depth"`
	Source   string  `json:"source"`
}

func main() {
	var err error
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "host=postgres user=postgres password=paradoxxDB2025 dbname=postgres sslmode=disable"
	}

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/api/filters/classes", getClasses)
	http.HandleFunc("/api/filters/regions", getRegions)
	http.HandleFunc("/api/species", getSpecies)
	http.HandleFunc("/api/species/", getSpeciesDetail)
	http.HandleFunc("/api/otoliths", getOtoliths)
	http.HandleFunc("/api/latest-sighting/", getLatestSighting)

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
	query := "SELECT id, vernacularname, scientific_name, image_urls, kingdom, phylum, class, _order, family, genus, species, habitat_type, diet, reported_regions, max_length_cm, max_weight_kg, age_of_maturity_years, depth_range_min, depth_range_max, conservation_status FROM species_data WHERE 1=1"
	
	args := []interface{}{}
	argCount := 1

	if class := r.URL.Query().Get("class"); class != "" {
		query += " AND class = $" + strconv.Itoa(argCount)
		args = append(args, class)
		argCount++
	}

	if status := r.URL.Query().Get("conservation_status"); status != "" {
		query += " AND conservation_status = $" + strconv.Itoa(argCount)
		args = append(args, status)
		argCount++
	}

	if minDepth := r.URL.Query().Get("min_depth"); minDepth != "" {
		query += " AND depth_range_min >= $" + strconv.Itoa(argCount)
		args = append(args, minDepth)
		argCount++
	}

	if maxDepth := r.URL.Query().Get("max_depth"); maxDepth != "" {
		query += " AND depth_range_max <= $" + strconv.Itoa(argCount)
		args = append(args, maxDepth)
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

	json.NewEncoder(w).Encode(speciesList)
}

func getSpeciesDetail(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/species/")
	
	var s Species
	var imageURLs, reportedRegions sql.NullString
	
	err := db.QueryRow("SELECT id, vernacularname, scientific_name, image_urls, kingdom, phylum, class, _order, family, genus, species, habitat_type, diet, reported_regions, max_length_cm, max_weight_kg, age_of_maturity_years, depth_range_min, depth_range_max, conservation_status FROM species_data WHERE id = $1", id).Scan(&s.ID, &s.VernacularName, &s.ScientificName, &imageURLs, &s.Kingdom, &s.Phylum, &s.Class, &s.Order, &s.Family, &s.Genus, &s.Species, &s.HabitatType, &s.Diet, &reportedRegions, &s.MaxLengthCm, &s.MaxWeightKg, &s.AgeOfMaturityYears, &s.DepthRangeMin, &s.DepthRangeMax, &s.ConservationStatus)
	
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
	query := "SELECT o.id, o.otolith_id, o.estimated_age, o.growth_rate, o.ring_count, o.area, o.perimeter, o.aspect_ratio, o.circularity, o.roundness, o.species_id, s.vernacularname FROM otolith_metadata o LEFT JOIN species_data s ON o.species_id = s.id"
	
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
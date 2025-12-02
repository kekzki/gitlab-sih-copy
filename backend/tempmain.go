// main.go
//
// A single-file Go HTTP API that exposes endpoints required by the taxonomy page.
// - Uses database/sql with github.com/lib/pq (Postgres driver).
// - Reads DB connection from environment variable DATABASE_URL (or fallback to individual vars).
// - Implements endpoints for filters, search, card listing, species details, otolith metadata,
//   latest sighting, growth traits and a placeholder abundance endpoint (requires domain-specific fields).
//
// NOTE: Adjust SQL column/table names if your schema differs. This file was written to follow the
// field/table names you supplied in the spec.
//
// Build:
//   go get github.com/lib/pq
//   go build -o api main.go
//
// Run (example):
//   DATABASE_URL="postgres://user:pass@localhost:5432/dbname?sslmode=disable" ./api
package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

func main() {
	var err error
	db, err = connectDB()
	if err != nil {
		log.Fatalf("DB connect error: %v", err)
	}
	defer db.Close()

	mux := http.NewServeMux()

	// Filter endpoints
	mux.HandleFunc("/classes", withCORS(classesHandler))
	mux.HandleFunc("/regions", withCORS(regionsHandler))
	mux.HandleFunc("/conservation-status", withCORS(conservationStatusHandler))
	mux.HandleFunc("/data-quality", withCORS(dataQualityHandler))
	mux.HandleFunc("/habitat-depth", withCORS(habitatDepthHandler))
	mux.HandleFunc("/time-filter", withCORS(timeFilterHandler))

	// Search / Cards
	mux.HandleFunc("/search", withCORS(searchHandler))
	mux.HandleFunc("/cards", withCORS(cardsHandler))

	// Species detail & ecological profile
	mux.HandleFunc("/species", withCORS(speciesHandler))

	// Otoliths
	mux.HandleFunc("/otoliths", withCORS(otolithsHandler))
	mux.HandleFunc("/otolith", withCORS(otolithHandler)) // query ?id=

	// Latest sighting
	mux.HandleFunc("/latest-sighting", withCORS(latestSightingHandler))

	// Growth traits
	mux.HandleFunc("/growth-traits", withCORS(growthTraitsHandler))

	// Abundance & dynamics - domain-specific; uses placeholders if fields missing
	mux.HandleFunc("/abundance", withCORS(abundanceHandler))

	addr := ":8080"
	log.Printf("API listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func connectDB() (*sql.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		user := os.Getenv("DB_USER")
		pass := os.Getenv("DB_PASS")
		host := os.Getenv("DB_HOST")
		port := os.Getenv("DB_PORT")
		name := os.Getenv("DB_NAME")
		if host == "" {
			host = "localhost"
		}
		if port == "" {
			port = "5432"
		}
		dsn = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, pass, host, port, name)
	}
	dbConn, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	// quick ping
	if err := dbConn.Ping(); err != nil {
		return nil, err
	}
	return dbConn, nil
}

// ---------- Utilities ----------

func withCORS(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Basic permissive CORS for frontend in docker; tweak in production.
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		h(w, r)
	}
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(v); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// parseFloatQuery returns pointer to float64 or nil if not present/invalid
func parseFloatQuery(r *http.Request, key string) *float64 {
	s := r.URL.Query().Get(key)
	if s == "" {
		return nil
	}
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return nil
	}
	return &f
}

// parseIntQuery
func parseIntQuery(r *http.Request, key string) *int {
	s := r.URL.Query().Get(key)
	if s == "" {
		return nil
	}
	i, err := strconv.Atoi(s)
	if err != nil {
		return nil
	}
	return &i
}

// ---------- Handlers ----------

// GET /classes
// Returns distinct classes from species_data.class
func classesHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`SELECT DISTINCT class FROM species_data WHERE class IS NOT NULL ORDER BY class`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var classes []string
	for rows.Next() {
		var c string
		if err := rows.Scan(&c); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		classes = append(classes, c)
	}
	writeJSON(w, map[string]interface{}{"classes": classes})
}

// GET /regions
// distinct occurrence_data.region
func regionsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`SELECT DISTINCT region FROM occurrence_data WHERE region IS NOT NULL ORDER BY region`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var regs []string
	for rows.Next() {
		var s string
		if err := rows.Scan(&s); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		regs = append(regs, s)
	}
	writeJSON(w, map[string]interface{}{"regions": regs})
}

// GET /conservation-status
// Aggregated counts (Critically Endangered, Endangered, Vulnerable, Least Concern) based on species_data.conservation_status
func conservationStatusHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`
		SELECT conservation_status, COUNT(*) FROM species_data
		WHERE conservation_status IS NOT NULL
		GROUP BY conservation_status
		ORDER BY COUNT DESC
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	m := map[string]int{}
	for rows.Next() {
		var s string
		var c int
		if err := rows.Scan(&s, &c); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		m[s] = c
	}
	writeJSON(w, map[string]interface{}{"conservation_status_counts": m})
}

// GET /data-quality
// Aggregated by occurrence_data.data_quality (or species_data.data_quality if you have it)
func dataQualityHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`
		SELECT data_quality, COUNT(*) FROM occurrence_data
		WHERE data_quality IS NOT NULL
		GROUP BY data_quality
		ORDER BY COUNT DESC
	`)
	if err != nil {
		// If occurrence_data doesn't have data_quality, return 501 with details.
		http.Error(w, fmt.Sprintf("query error: %v — ensure occurrence_data.data_quality exists", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	m := map[string]int{}
	for rows.Next() {
		var s string
		var c int
		if err := rows.Scan(&s, &c); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		m[s] = c
	}
	writeJSON(w, map[string]interface{}{"data_quality_counts": m})
}

// GET /habitat-depth?min=0&max=5000
// Finds species whose depth range overlaps the query range.
// Table: species_data with depth_range_min, depth_range_max
func habitatDepthHandler(w http.ResponseWriter, r *http.Request) {
	minQ := parseFloatQuery(r, "min")
	maxQ := parseFloatQuery(r, "max")
	min := 0.0
	max := 5000.0
	if minQ != nil {
		min = *minQ
	}
	if maxQ != nil {
		max = *maxQ
	}
	if min > max {
		http.Error(w, "min cannot be greater than max", http.StatusBadRequest)
		return
	}
	// Overlap condition: depth_range_min <= max AND depth_range_max >= min
	rows, err := db.Query(`
		SELECT id, vernacularname, scientific_name, image_urls, depth_range_min, depth_range_max
		FROM species_data
		WHERE depth_range_min IS NOT NULL AND depth_range_max IS NOT NULL
		  AND depth_range_min <= $1 AND depth_range_max >= $2
		LIMIT 200
	`, max, min)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type rec struct {
		ID                 int      `json:"id"`
		VernacularName     string   `json:"vernacularname"`
		ScientificName     string   `json:"scientific_name"`
		ImageURLs          []string `json:"image_urls"`
		DepthRangeMin      *float64 `json:"depth_range_min"`
		DepthRangeMax      *float64 `json:"depth_range_max"`
	}
	res := []rec{}
	for rows.Next() {
		var rID int
		var v, s, imgs sql.NullString
		var dmin, dmax sql.NullFloat64
		if err := rows.Scan(&rID, &v, &s, &imgs, &dmin, &dmax); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var imgSlice []string
		if imgs.Valid && imgs.String != "" {
			// Assuming image_urls stored as comma-separated list or JSON array.
			imgSlice = parseImageURLsField(imgs.String)
		}
		var dm, dM *float64
		if dmin.Valid {
			val := dmin.Float64
			dm = &val
		}
		if dmax.Valid {
			val := dmax.Float64
			dM = &val
		}
		res = append(res, rec{
			ID:             rID,
			VernacularName: v.String,
			ScientificName: s.String,
			ImageURLs:      imgSlice,
			DepthRangeMin:  dm,
			DepthRangeMax:  dM,
		})
	}
	writeJSON(w, map[string]interface{}{"results": res})
}

// Helper to parse image_urls column - tolerant implementation
func parseImageURLsField(s string) []string {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil
	}
	// if it's a JSON array like ["url1","url2"] -> remove [] and quotes
	if strings.HasPrefix(s, "[") && strings.HasSuffix(s, "]") {
		s = strings.TrimPrefix(s, "[")
		s = strings.TrimSuffix(s, "]")
		parts := strings.Split(s, ",")
		out := []string{}
		for _, p := range parts {
			p = strings.TrimSpace(p)
			p = strings.Trim(p, `"' `)
			if p != "" {
				out = append(out, p)
			}
		}
		return out
	}
	// otherwise assume comma-separated
	parts := strings.Split(s, ",")
	out := []string{}
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

// GET /time-filter?range=all|24h|7d|1m|1y|5y
// returns aggregated counts or occurrences in range
func timeFilterHandler(w http.ResponseWriter, r *http.Request) {
	ra := r.URL.Query().Get("range")
	var where string
	switch ra {
	case "", "all":
		where = "" // no time filter
	case "24h":
		where = "WHERE eventdate >= NOW() - INTERVAL '24 hours'"
	case "7d":
		where = "WHERE eventdate >= NOW() - INTERVAL '7 days'"
	case "1m":
		where = "WHERE eventdate >= NOW() - INTERVAL '1 month'"
	case "1y":
		where = "WHERE eventdate >= NOW() - INTERVAL '1 year'"
	case "5y":
		where = "WHERE eventdate >= NOW() - INTERVAL '5 years'"
	default:
		http.Error(w, "invalid range; allowed: all, 24h, 7d, 1m, 1y, 5y", http.StatusBadRequest)
		return
	}
	query := fmt.Sprintf(`SELECT COUNT(*) FROM occurrence_data %s`, where)
	var cnt int
	if err := db.QueryRow(query).Scan(&cnt); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, map[string]interface{}{"range": ra, "count": cnt})
}

// GET /search?q=term
// searches vernacularname OR scientific_name in species_data and returns card info
func searchHandler(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if q == "" {
		writeJSON(w, map[string]interface{}{"results": []interface{}{}})
		return
	}
	pat := "%" + strings.ToLower(q) + "%"
	rows, err := db.Query(`
		SELECT id, image_urls, vernacularname, scientific_name, conservation_status
		FROM species_data
		WHERE LOWER(vernacularname) LIKE $1 OR LOWER(scientific_name) LIKE $1
		LIMIT 200
	`, pat)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type card struct {
		ID                 int      `json:"id"`
		ImageURLs          []string `json:"image_urls"`
		VernacularName     string   `json:"vernacularname"`
		ScientificName     string   `json:"scientific_name"`
		ConservationStatus string   `json:"conservation_status"`
	}
	res := []card{}
	for rows.Next() {
		var id int
		var imgs sql.NullString
		var v, s, cs sql.NullString
		if err := rows.Scan(&id, &imgs, &v, &s, &cs); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		imgSlice := []string{}
		if imgs.Valid {
			imgSlice = parseImageURLsField(imgs.String)
		}
		res = append(res, card{
			ID:                 id,
			ImageURLs:          imgSlice,
			VernacularName:     v.String,
			ScientificName:     s.String,
			ConservationStatus: cs.String,
		})
	}
	writeJSON(w, map[string]interface{}{"results": res})
}

// GET /cards
// returns cards; supports filters via query params:
// class, region, conservation_status, data_quality, min_depth, max_depth, time_range, q (search)
func cardsHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	filters := []string{}
	args := []interface{}{}
	argi := 1

	if v := q.Get("class"); v != "" {
		filters = append(filters, fmt.Sprintf("s.class = $%d", argi)); args = append(args, v); argi++
	}
	if v := q.Get("region"); v != "" {
		// join on occurrence_data to filter by region
		filters = append(filters, fmt.Sprintf("o.region = $%d", argi)); args = append(args, v); argi++
	}
	if v := q.Get("conservation_status"); v != "" {
		filters = append(filters, fmt.Sprintf("s.conservation_status = $%d", argi)); args = append(args, v); argi++
	}
	if v := q.Get("data_quality"); v != "" {
		filters = append(filters, fmt.Sprintf("o.data_quality = $%d", argi)); args = append(args, v); argi++
	}
	// depth overlap
	minDepth := parseFloatQuery(r, "min_depth")
	maxDepth := parseFloatQuery(r, "max_depth")
	if minDepth != nil || maxDepth != nil {
		min := 0.0
		max := 5000.0
		if minDepth != nil {
			min = *minDepth
		}
		if maxDepth != nil {
			max = *maxDepth
		}
		filters = append(filters, fmt.Sprintf("s.depth_range_min <= $%d AND s.depth_range_max >= $%d", argi, argi+1))
		args = append(args, max, min)
		argi += 2
	}
	// time_range via occurrence_data.eventdate
	timeRange := q.Get("time_range")
	if tr := timeRange; tr != "" && tr != "all" {
		switch tr {
		case "24h":
			filters = append(filters, fmt.Sprintf("o.eventdate >= NOW() - INTERVAL '24 hours'"))
		case "7d":
			filters = append(filters, fmt.Sprintf("o.eventdate >= NOW() - INTERVAL '7 days'"))
		case "1m":
			filters = append(filters, fmt.Sprintf("o.eventdate >= NOW() - INTERVAL '1 month'"))
		case "1y":
			filters = append(filters, fmt.Sprintf("o.eventdate >= NOW() - INTERVAL '1 year'"))
		case "5y":
			filters = append(filters, fmt.Sprintf("o.eventdate >= NOW() - INTERVAL '5 years'"))
		default:
			// ignore invalid
		}
	}
	// q param search
	if s := strings.TrimSpace(q.Get("q")); s != "" {
		pat := "%" + strings.ToLower(s) + "%"
		filters = append(filters, fmt.Sprintf("(LOWER(s.vernacularname) LIKE $%d OR LOWER(s.scientific_name) LIKE $%d)", argi, argi))
		args = append(args, pat)
		argi++
	}

	// Build query joining species_data (s) and occurrence_data (o) left join so cards can be filtered by occurrence fields.
	base := `
		SELECT DISTINCT s.id, s.image_urls, s.vernacularname, s.scientific_name, s.conservation_status
		FROM species_data s
		LEFT JOIN occurrence_data o ON o.species_id = s.id
	`
	where := ""
	if len(filters) > 0 {
		where = "WHERE " + strings.Join(filters, " AND ")
	}
	limit := 200
	query := fmt.Sprintf("%s %s LIMIT %d", base, where, limit)
	rows, err := db.Query(query, args...)
	if err != nil {
		http.Error(w, fmt.Sprintf("query error: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type card struct {
		ID                 int      `json:"id"`
		ImageURLs          []string `json:"image_urls"`
		VernacularName     string   `json:"vernacularname"`
		ScientificName     string   `json:"scientific_name"`
		ConservationStatus string   `json:"conservation_status"`
	}
	res := []card{}
	for rows.Next() {
		var id int
		var imgs sql.NullString
		var v, sname, cs sql.NullString
		if err := rows.Scan(&id, &imgs, &v, &sname, &cs); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		imgSlice := []string{}
		if imgs.Valid {
			imgSlice = parseImageURLsField(imgs.String)
		}
		res = append(res, card{
			ID:                 id,
			ImageURLs:          imgSlice,
			VernacularName:     v.String,
			ScientificName:     sname.String,
			ConservationStatus: cs.String,
		})
	}
	writeJSON(w, map[string]interface{}{"results": res})
}

// GET /species?id= or /species?scientific_name=
func speciesHandler(w http.ResponseWriter, r *http.Request) {
	idQ := r.URL.Query().Get("id")
	nameQ := r.URL.Query().Get("scientific_name")
	if idQ == "" && nameQ == "" {
		http.Error(w, "provide id or scientific_name", http.StatusBadRequest)
		return
	}
	var row *sql.Row
	if idQ != "" {
		row = db.QueryRow(`
			SELECT id, image_urls, vernacularname, scientific_name, conservation_status,
			       kingdom, phylum, class, _order, family, genus, species,
			       description,
			       habitat_type, diet, reported_regions,
			       otolith_availability, edna_availability, images_analyzed,
			       max_length_cm, max_weight_kg, max_age, age_of_maturity_years, growth_rate
			FROM species_data
			WHERE id = $1
		`, idQ)
	} else {
		row = db.QueryRow(`
			SELECT id, image_urls, vernacularname, scientific_name, conservation_status,
			       kingdom, phylum, class, _order, family, genus, species,
			       description,
			       habitat_type, diet, reported_regions,
			       otolith_availability, edna_availability, images_analyzed,
			       max_length_cm, max_weight_kg, max_age, age_of_maturity_years, growth_rate
			FROM species_data
			WHERE scientific_name = $1
			LIMIT 1
		`, nameQ)
	}
	var (
		id                                           int
		imageURLs, vernacularname, scientificName    sql.NullString
		conservationStatus                           sql.NullString
		kingdom, phylum, className, orderCol         sql.NullString
		family, genus, speciesCol                    sql.NullString
		description                                  sql.NullString
		habitatType, diet, reportedRegions           sql.NullString
		otolithAvail, ednaAvail                      sql.NullString
		imagesAnalyzed                               sql.NullInt64
		maxLengthCm, maxWeightKg, maxAge            sql.NullFloat64
		ageOfMaturity                                 sql.NullFloat64
		growthRate                                    sql.NullFloat64
	)
	err := row.Scan(&id, &imageURLs, &vernacularname, &scientificName, &conservationStatus,
		&kingdom, &phylum, &className, &orderCol, &family, &genus, &speciesCol,
		&description,
		&habitatType, &diet, &reportedRegions,
		&otolithAvail, &ednaAvail, &imagesAnalyzed,
		&maxLengthCm, &maxWeightKg, &maxAge, &ageOfMaturity, &growthRate)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "species not found", http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf("scan error: %v", err), http.StatusInternalServerError)
		return
	}
	resp := map[string]interface{}{
		"id":                  id,
		"image_urls":          []string{}, // filled below
		"vernacularname":      vernacularname.String,
		"scientific_name":     scientificName.String,
		"conservation_status": conservationStatus.String,
		"taxonomy": map[string]string{
			"kingdom": kingdom.String,
			"phylum":  phylum.String,
			"class":   className.String,
			"order":   orderCol.String,
			"family":  family.String,
			"genus":   genus.String,
			"species": speciesCol.String,
		},
		"description": description.String,
		"ecological_profile": map[string]interface{}{
			"habitat": habitatType.String,
			"diet":    diet.String,
			"range":   reportedRegions.String,
		},
		"ai_analysis_status": map[string]interface{}{
			"otolith_data_availability": otolithAvail.String,
			"edna_sequence_availability": ednaAvail.String,
			"images_analyzed":            imagesAnalyzed.Int64,
		},
		"growth_traits": map[string]interface{}{
			"max_length_cm":           nullFloatToPtr(maxLengthCm),
			"max_weight_kg":           nullFloatToPtr(maxWeightKg),
			"max_age":                 nullFloatToPtr(maxAge),
			"age_at_first_maturity":   nullFloatToPtr(ageOfMaturity),
			"growth_rate":             nullFloatToPtr(growthRate),
		},
	}
	if i

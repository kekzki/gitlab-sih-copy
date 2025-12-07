package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var dbPool *pgxpool.Pool

// --- Structs ---

type Species struct {
	SpeciesID int             `json:"species_id"`
	UploadID  int             `json:"upload_id"`
	Data      json.RawMessage `json:"data"`
}

type OccurrenceData struct {
	OccurrenceID string          `json:"occurrence_id"`
	SpeciesID    int             `json:"species_id"`
	UploadID     int             `json:"upload_id"`
	Region       string          `json:"region"`
	Data         json.RawMessage `json:"data"`
}

type OceanographicData struct {
	ID       int             `json:"id"`
	Region   string          `json:"region"`
	UploadID int             `json:"upload_id"`
	Data     json.RawMessage `json:"data"`
}

type SpeciesDiversity struct {
	ID       int             `json:"id"`
	Region   string          `json:"region"`
	UploadID int             `json:"upload_id"`
	Data     json.RawMessage `json:"data"`
}

type MonthlyAbundance struct {
	ID        int             `json:"id"`
	SpeciesID int             `json:"species_id"`
	Region    string          `json:"region"`
	UploadID  int             `json:"upload_id"`
	Data      json.RawMessage `json:"data"`
}

type JuvenileAdultData struct {
	ID        int             `json:"id"`
	SpeciesID int             `json:"species_id"`
	Region    string          `json:"region"`
	UploadID  int             `json:"upload_id"`
	Data      json.RawMessage `json:"data"`
}

type Otolith struct {
	OtolithID         int     `json:"otolith_id"`
	SpeciesID         int     `json:"species_id"`
	EstimatedAge      int     `json:"estimated_age"`
	RingCount         int     `json:"ring_count"`
	AreaMm2           float64 `json:"area_mm2"`
	PerimeterMm       float64 `json:"perimeter_mm"`
	LengthMm          float64 `json:"length_mm"`
	WidthMm           float64 `json:"width_mm"`
	AspectRatio       float64 `json:"aspect_ratio"`
	Circularity       float64 `json:"circularity"`
	RawImageURL       string  `json:"raw_image_url"`
	ProcessedImageURL string  `json:"processed_image_url"`
	UploadID          int     `json:"upload_id"`
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
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:nunsz2mwnnuqvcbn@paradoxx-postgres-0rxxss:5432/postgres?sslmode=disable"
	}

	// Create connection pool
	dbPool, err = pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatal("Unable to create connection pool:", err)
	}
	defer dbPool.Close()

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = dbPool.Ping(ctx)
	if err != nil {
		log.Fatal("Unable to ping database:", err)
	}

	log.Println("Successfully connected to database!")

	// Species & Taxonomy Routes
	http.HandleFunc("/api/species", getSpecies)
	http.HandleFunc("/api/species/", getSpeciesDetail)
	http.HandleFunc("/api/filters/regions", getRegions)

	// Otolith Routes
	http.HandleFunc("/api/otoliths", getOtoliths)
	http.HandleFunc("/api/otoliths/", getOtolithDetail)

	// Occurrence Routes
	http.HandleFunc("/api/occurrence/latest", getLatestOccurrence)
	http.HandleFunc("/api/occurrence", getOccurrenceData)

	// Oceanographic Routes
	http.HandleFunc("/api/oceanographic/parameters", getOceanographicParameters)
	http.HandleFunc("/api/oceanographic/regions", getOceanographicRegions)

	// Biodiversity Routes
	http.HandleFunc("/api/biodiversity/metrics", getBiodiversityMetrics)

	// Marine Trends Routes
	http.HandleFunc("/api/marine-trends/abundance", getMonthlyAbundance)
	http.HandleFunc("/api/marine-trends/juvenile-adult", getJuvenileAdultRatio)
	http.HandleFunc("/api/marine-trends/species-list", getSpeciesList)

	// BLAST Route
	http.HandleFunc("/api/blast", handleBlast)

	// Image Analysis Route (NEW ROUTE)
	http.HandleFunc("/api/analyze-image", handleAnalyzeImage)

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(http.DefaultServeMux)))
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// --- Handler Functions ---

func getRegions(w http.ResponseWriter, r *http.Request) {
	rows, err := dbPool.Query(context.Background(), "SELECT DISTINCT region_name FROM region_metadata ORDER BY region_name")
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

func getSpecies(w http.ResponseWriter, r *http.Request) {
	query := "SELECT species_id, upload_id, data FROM species_data WHERE 1=1"
	args := []interface{}{}
	argCount := 1

	if search := r.URL.Query().Get("search"); search != "" {
		query += fmt.Sprintf(" AND (data->>'vernacularname' ILIKE $%d OR data->>'scientific_name' ILIKE $%d)", argCount, argCount)
		args = append(args, "%"+search+"%")
		argCount++
	}

	if class := r.URL.Query().Get("class"); class != "" {
		query += fmt.Sprintf(" AND data->>'class' = $%d", argCount)
		args = append(args, class)
		argCount++
	}

	rows, err := dbPool.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var speciesList []Species
	for rows.Next() {
		var s Species
		if err := rows.Scan(&s.SpeciesID, &s.UploadID, &s.Data); err != nil {
			continue
		}
		speciesList = append(speciesList, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(speciesList)
}

func getSpeciesDetail(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/species/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid species ID", http.StatusBadRequest)
		return
	}

	var s Species
	err = dbPool.QueryRow(context.Background(), "SELECT species_id, upload_id, data FROM species_data WHERE species_id = $1", id).Scan(&s.SpeciesID, &s.UploadID, &s.Data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

func getSpeciesList(w http.ResponseWriter, r *http.Request) {
	rows, err := dbPool.Query(context.Background(), "SELECT DISTINCT data->>'scientific_name' as name FROM species_data WHERE data->>'scientific_name' IS NOT NULL ORDER BY name")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var names []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			continue
		}
		names = append(names, name)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(names)
}

func getOtoliths(w http.ResponseWriter, r *http.Request) {
	rows, err := dbPool.Query(context.Background(), `
		SELECT otolith_id, species_id, estimated_age, ring_count, area_mm2, perimeter_mm, 
		       length_mm, width_mm, aspect_ratio, circularity, raw_image_url, processed_image_url, upload_id
		FROM otolith_metadata`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var otoliths []Otolith
	for rows.Next() {
		var o Otolith
		err := rows.Scan(&o.OtolithID, &o.SpeciesID, &o.EstimatedAge, &o.RingCount, &o.AreaMm2,
			&o.PerimeterMm, &o.LengthMm, &o.WidthMm, &o.AspectRatio, &o.Circularity,
			&o.RawImageURL, &o.ProcessedImageURL, &o.UploadID)
		if err != nil {
			continue
		}
		otoliths = append(otoliths, o)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(otoliths)
}

func getOtolithDetail(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/otoliths/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid otolith ID", http.StatusBadRequest)
		return
	}

	var o Otolith
	err = dbPool.QueryRow(context.Background(), `
		SELECT otolith_id, species_id, estimated_age, ring_count, area_mm2, perimeter_mm,
		       length_mm, width_mm, aspect_ratio, circularity, raw_image_url, processed_image_url, upload_id
		FROM otolith_metadata WHERE otolith_id = $1`, id).Scan(
		&o.OtolithID, &o.SpeciesID, &o.EstimatedAge, &o.RingCount, &o.AreaMm2,
		&o.PerimeterMm, &o.LengthMm, &o.WidthMm, &o.AspectRatio, &o.Circularity,
		&o.RawImageURL, &o.ProcessedImageURL, &o.UploadID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(o)
}

func getOccurrenceData(w http.ResponseWriter, r *http.Request) {
	query := "SELECT occurrence_id, species_id, upload_id, region, data FROM occurrence_data WHERE 1=1"
	args := []interface{}{}
	argCount := 1

	if region := r.URL.Query().Get("region"); region != "" {
		query += fmt.Sprintf(" AND region = $%d", argCount)
		args = append(args, region)
		argCount++
	}

	if speciesID := r.URL.Query().Get("species_id"); speciesID != "" {
		query += fmt.Sprintf(" AND species_id = $%d", argCount)
		args = append(args, speciesID)
		argCount++
	}

	rows, err := dbPool.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var occurrences []OccurrenceData
	for rows.Next() {
		var occ OccurrenceData
		if err := rows.Scan(&occ.OccurrenceID, &occ.SpeciesID, &occ.UploadID, &occ.Region, &occ.Data); err != nil {
			continue
		}
		occurrences = append(occurrences, occ)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(occurrences)
}

func getLatestOccurrence(w http.ResponseWriter, r *http.Request) {
	speciesID := r.URL.Query().Get("species_id")
	if speciesID == "" {
		http.Error(w, "species_id parameter required", http.StatusBadRequest)
		return
	}

	var occ OccurrenceData
	err := dbPool.QueryRow(context.Background(), `
		SELECT occurrence_id, species_id, upload_id, region, data 
		FROM occurrence_data 
		WHERE species_id = $1 
		ORDER BY (data->>'eventdate')::date DESC LIMIT 1`, speciesID).Scan(
		&occ.OccurrenceID, &occ.SpeciesID, &occ.UploadID, &occ.Region, &occ.Data)

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(occ)
}

func getOceanographicRegions(w http.ResponseWriter, r *http.Request) {
	rows, err := dbPool.Query(context.Background(), "SELECT DISTINCT region FROM oceanographic_data ORDER BY region")
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
	query := "SELECT id, region, upload_id, data FROM oceanographic_data WHERE 1=1"
	args := []interface{}{}
	argCount := 1

	if region := r.URL.Query().Get("region"); region != "" {
		query += fmt.Sprintf(" AND region = $%d", argCount)
		args = append(args, region)
		argCount++
	}

	if startDate := r.URL.Query().Get("start_date"); startDate != "" {
		query += fmt.Sprintf(" AND (data->>'eventdate')::date >= $%d", argCount)
		args = append(args, startDate)
		argCount++
	}

	if endDate := r.URL.Query().Get("end_date"); endDate != "" {
		query += fmt.Sprintf(" AND (data->>'eventdate')::date <= $%d", argCount)
		args = append(args, endDate)
		argCount++
	}

	query += " ORDER BY (data->>'eventdate')::date"

	rows, err := dbPool.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var parameters []OceanographicData
	for rows.Next() {
		var p OceanographicData
		if err := rows.Scan(&p.ID, &p.Region, &p.UploadID, &p.Data); err != nil {
			continue
		}
		parameters = append(parameters, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(parameters)
}

func getBiodiversityMetrics(w http.ResponseWriter, r *http.Request) {
	query := "SELECT id, region, upload_id, data FROM species_diversity WHERE 1=1"
	args := []interface{}{}
	argCount := 1

	if region := r.URL.Query().Get("region"); region != "" {
		query += fmt.Sprintf(" AND region = $%d", argCount)
		args = append(args, region)
		argCount++
	}

	if startYear := r.URL.Query().Get("start_year"); startYear != "" {
		query += fmt.Sprintf(" AND (data->>'year')::int >= $%d", argCount)
		args = append(args, startYear)
		argCount++
	}

	if endYear := r.URL.Query().Get("end_year"); endYear != "" {
		query += fmt.Sprintf(" AND (data->>'year')::int <= $%d", argCount)
		args = append(args, endYear)
		argCount++
	}

	rows, err := dbPool.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var metrics []SpeciesDiversity
	for rows.Next() {
		var m SpeciesDiversity
		if err := rows.Scan(&m.ID, &m.Region, &m.UploadID, &m.Data); err != nil {
			continue
		}
		metrics = append(metrics, m)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}

func getMonthlyAbundance(w http.ResponseWriter, r *http.Request) {
	query := "SELECT id, species_id, region, upload_id, data FROM monthly_location_abundance WHERE 1=1"
	args := []interface{}{}
	argCount := 1

	if speciesID := r.URL.Query().Get("species_id"); speciesID != "" {
		query += fmt.Sprintf(" AND species_id = $%d", argCount)
		args = append(args, speciesID)
		argCount++
	}

	if region := r.URL.Query().Get("region"); region != "" {
		query += fmt.Sprintf(" AND region = $%d", argCount)
		args = append(args, region)
		argCount++
	}

	rows, err := dbPool.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var abundances []MonthlyAbundance
	for rows.Next() {
		var a MonthlyAbundance
		if err := rows.Scan(&a.ID, &a.SpeciesID, &a.Region, &a.UploadID, &a.Data); err != nil {
			continue
		}
		abundances = append(abundances, a)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(abundances)
}

func getJuvenileAdultRatio(w http.ResponseWriter, r *http.Request) {
	query := "SELECT id, species_id, region, upload_id, data FROM juvenile_adult_location_year WHERE 1=1"
	args := []interface{}{}
	argCount := 1

	if speciesID := r.URL.Query().Get("species_id"); speciesID != "" {
		query += fmt.Sprintf(" AND species_id = $%d", argCount)
		args = append(args, speciesID)
		argCount++
	}

	if region := r.URL.Query().Get("region"); region != "" {
		query += fmt.Sprintf(" AND region = $%d", argCount)
		args = append(args, region)
		argCount++
	}

	rows, err := dbPool.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var ratios []JuvenileAdultData
	for rows.Next() {
		var j JuvenileAdultData
		if err := rows.Scan(&j.ID, &j.SpeciesID, &j.Region, &j.UploadID, &j.Data); err != nil {
			continue
		}
		ratios = append(ratios, j)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ratios)
}

// --- Image Analysis Handler (FastAPI Integration) ---

func handleAnalyzeImage(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(20 << 20)
	if err != nil {
		http.Error(w, "Failed to parse form: "+err.Error(), http.StatusBadRequest)
		return
	}

	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file 'file' from request: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	var requestBody bytes.Buffer
	multipartWriter := multipart.NewWriter(&requestBody)

	part, err := multipartWriter.CreateFormFile("file", fileHeader.Filename)
	if err != nil {
		http.Error(w, "Failed to create form file part: "+err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = io.Copy(part, file)
	if err != nil {
		http.Error(w, "Failed to copy file data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = multipartWriter.Close()
	if err != nil {
		http.Error(w, "Failed to close multipart writer: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fastAPIServiceURL := "http://ml-service:8000/analyze"

	req, err := http.NewRequest("POST", fastAPIServiceURL, &requestBody)
	if err != nil {
		http.Error(w, "Failed to create request to ML service: "+err.Error(), http.StatusInternalServerError)
		return
	}

	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error connecting to ML service at %s: %v", fastAPIServiceURL, err)
		http.Error(w, "ML service request failed: "+err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	contentType := resp.Header.Get("Content-Type")
	w.Header().Set("Content-Type", contentType)
	w.WriteHeader(resp.StatusCode)

	_, err = io.Copy(w, resp.Body)
	if err != nil {
		log.Printf("Failed to stream response body to client: %v", err)
	}
}

// --- BLAST Functions ---

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
		http.Error(w, "No valid sequence found", http.StatusBadRequest)
		return
	}

	rid, err := submitToNCBI(sequence)
	if err != nil {
		http.Error(w, "NCBI submission failed: "+err.Error(), http.StatusBadGateway)
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
			http.Error(w, "Status check failed", http.StatusBadGateway)
			return
		}
		if status == "FAILED" || status == "UNKNOWN" {
			http.Error(w, "BLAST failed", http.StatusBadGateway)
			return
		}
	}

	if status == "WAITING" {
		http.Error(w, "BLAST timed out", http.StatusRequestTimeout)
		return
	}

	results, err := getNCBIResults(rid)
	if err != nil {
		http.Error(w, "Failed to get results", http.StatusBadGateway)
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

func submitToNCBI(sequence string) (string, error) {
	apiURL := "https://blast.ncbi.nlm.nih.gov/Blast.cgi"
	data := url.Values{}
	data.Set("CMD", "Put")
	data.Set("PROGRAM", "blastn")
	data.Set("DATABASE", "nt")
	data.Set("QUERY", sequence)
	data.Set("tool", "MarineDB")
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

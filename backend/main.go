package main

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"mime/multipart"
	"net/http"
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

// --- Main ---

func main() {
	// 1. HARDCODED DATABASE URL (Matches docker-compose)
	dbURL := "postgres://user:mysecretpassword@db:5432/myappdb?sslmode=disable"

	var err error
	
	// 2. RETRY LOGIC (Prevents crash if DB is slow)
	maxRetries := 15
	for i := 0; i < maxRetries; i++ {
		log.Printf("Connecting to database (Attempt %d/%d)...", i+1, maxRetries)
		
		dbPool, err = pgxpool.New(context.Background(), dbURL)
		if err == nil {
			err = dbPool.Ping(context.Background())
			if err == nil {
				log.Println("✅ Successfully connected to database!")
				break
			}
		}
		
		log.Printf("Database not ready yet (%v). Waiting 2 seconds...", err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatal("❌ Could not connect to database after multiple retries. Exiting.")
	}
	defer dbPool.Close()

	// 3. REGISTER ALL ROUTES
	http.HandleFunc("/api/species", getSpecies)
	http.HandleFunc("/api/species/", getSpeciesDetail)
	http.HandleFunc("/api/filters/regions", getRegions)
	http.HandleFunc("/api/otoliths", getOtoliths)
	http.HandleFunc("/api/otoliths/", getOtolithDetail)
	http.HandleFunc("/api/analyze-image", handleAnalyzeImage)

	log.Println("🚀 Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(http.DefaultServeMux)))
}

// --- Handler Functions ---

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

func handleAnalyzeImage(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 20MB limit
	err := r.ParseMultipartForm(20 << 20)
	if err != nil {
		http.Error(w, "Failed to parse form: "+err.Error(), http.StatusBadRequest)
		return
	}

	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	var requestBody bytes.Buffer
	multipartWriter := multipart.NewWriter(&requestBody)
	part, _ := multipartWriter.CreateFormFile("file", fileHeader.Filename)
	io.Copy(part, file)
	multipartWriter.Close()

	// Internal Docker URL
	fastAPIServiceURL := "http://ml-service:8000/analyze"

	req, _ := http.NewRequest("POST", fastAPIServiceURL, &requestBody)
	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error connecting to ML service: %v", err)
		http.Error(w, "ML service unavailable", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func getSpecies(w http.ResponseWriter, r *http.Request) {
	rows, err := dbPool.Query(context.Background(), "SELECT species_id, upload_id, data FROM species_data")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var speciesList []Species
	for rows.Next() {
		var s Species
		if err := rows.Scan(&s.SpeciesID, &s.UploadID, &s.Data); err == nil {
			speciesList = append(speciesList, s)
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(speciesList)
}

func getSpeciesDetail(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/species/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	var s Species
	err = dbPool.QueryRow(context.Background(), "SELECT species_id, upload_id, data FROM species_data WHERE species_id = $1", id).Scan(&s.SpeciesID, &s.UploadID, &s.Data)
	if err != nil {
		http.Error(w, "Species not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

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
		if err := rows.Scan(&region); err == nil {
			regions = append(regions, region)
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(regions)
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
	var list []Otolith
	for rows.Next() {
		var o Otolith
		if err := rows.Scan(&o.OtolithID, &o.SpeciesID, &o.EstimatedAge, &o.RingCount, &o.AreaMm2, &o.PerimeterMm, &o.LengthMm, &o.WidthMm, &o.AspectRatio, &o.Circularity, &o.RawImageURL, &o.ProcessedImageURL, &o.UploadID); err == nil {
			list = append(list, o)
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

func getOtolithDetail(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/otoliths/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	var o Otolith
	err = dbPool.QueryRow(context.Background(), `
		SELECT otolith_id, species_id, estimated_age, ring_count, area_mm2, perimeter_mm, 
		       length_mm, width_mm, aspect_ratio, circularity, raw_image_url, processed_image_url, upload_id
		FROM otolith_metadata WHERE otolith_id = $1`, id).Scan(&o.OtolithID, &o.SpeciesID, &o.EstimatedAge, &o.RingCount, &o.AreaMm2, &o.PerimeterMm, &o.LengthMm, &o.WidthMm, &o.AspectRatio, &o.Circularity, &o.RawImageURL, &o.ProcessedImageURL, &o.UploadID)
	if err != nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(o)
}

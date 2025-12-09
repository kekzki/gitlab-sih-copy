package main

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"github.com/agnivade/levenshtein"
	"github.com/jackc/pgx/v5"
)

// --- 1. Schema Definitions ---

type CanonicalSchema struct {
	TableName string
	Columns   []string
}

// RegistrySchemas defines the "Ground Truth" - the columns we expect for each table.
var RegistrySchemas = []CanonicalSchema{
	{
		TableName: "species_data",
		Columns:   []string{"scientific_name", "vernacularname", "genus", "family", "class", "iucn_status", "max_weight_kg"},
	},
	{
		TableName: "occurrence_data",
		Columns:   []string{"occurrence_id", "species_id", "eventdate", "decimallatitude", "decimallongitude", "depth", "region"},
	},
	{
		TableName: "oceanographic_data",
		Columns:   []string{"eventdate", "region", "temperature_c", "salinity_psu", "dissolved_oxygen_mg_l", "ph"},
	},
	{
		TableName: "otolith_metadata",
		Columns:   []string{"species_id", "estimated_age", "ring_count", "area_mm2", "length_mm", "width_mm"},
	},
}

// --- 2. Math & Logic ---

func normalize(s string) string {
	s = strings.ToLower(s)
	s = strings.ReplaceAll(s, "_", "")
	s = strings.ReplaceAll(s, "-", "")
	s = strings.ReplaceAll(s, " ", "")
	return s
}

// calculateSimilarity returns 0.0 to 1.0 (1.0 is a perfect match)
func calculateSimilarity(fileCol, canonCol string) float64 {
	nA := normalize(fileCol)
	nB := normalize(canonCol)

	if nA == nB {
		return 1.0
	}

	// Substring bonus (e.g., "lat" matches "decimalLatitude")
	if len(nA) > 3 && len(nB) > 3 {
		if strings.Contains(nA, nB) || strings.Contains(nB, nA) {
			return 0.85
		}
	}

	dist := levenshtein.ComputeDistance(nA, nB)
	maxLen := float64(len(nA))
	if len(nB) > len(nA) {
		maxLen = float64(len(nB))
	}

	if maxLen == 0 {
		return 0.0
	}

	return 1.0 - (float64(dist) / maxLen)
}

// --- 3. Schema Detection ---

func detectSchema(headers []string) (*CanonicalSchema, error) {
	var bestSchema *CanonicalSchema
	bestScore := 0.0

	for _, schema := range RegistrySchemas {
		totalScore := 0.0
		for _, canonCol := range schema.Columns {
			maxColScore := 0.0
			for _, fileCol := range headers {
				score := calculateSimilarity(fileCol, canonCol)
				if score > maxColScore {
					maxColScore = score
				}
			}
			totalScore += maxColScore
		}

		avgScore := totalScore / float64(len(schema.Columns))
		
		// Copy variable to avoid pointer issues in loop
		s := schema
		if avgScore > bestScore {
			bestScore = avgScore
			bestSchema = &s
		}
	}

	if bestScore < 0.40 {
		return nil, fmt.Errorf("unknown data format (confidence: %.2f)", bestScore)
	}

	return bestSchema, nil
}

func buildColumnMapping(schema *CanonicalSchema, fileHeaders []string) map[string]string {
	mapping := make(map[string]string)

	for _, canonCol := range schema.Columns {
		bestMatch := ""
		bestScore := 0.0

		for _, fileCol := range fileHeaders {
			score := calculateSimilarity(fileCol, canonCol)
			if score > bestScore {
				bestScore = score
				bestMatch = fileCol
			}
		}

		if bestScore > 0.5 {
			mapping[canonCol] = bestMatch
		} else {
			mapping[canonCol] = ""
		}
	}
	return mapping
}

// --- 4. File Parsing ---

func parseFile(file multipart.File, filename string) ([]map[string]interface{}, []string, error) {
	file.Seek(0, 0) // Ensure we read from start

	if strings.HasSuffix(strings.ToLower(filename), ".json") {
		var rows []map[string]interface{}
		decoder := json.NewDecoder(file)
		if err := decoder.Decode(&rows); err != nil {
			return nil, nil, err
		}
		if len(rows) == 0 {
			return nil, nil, errors.New("json file is empty")
		}
		var headers []string
		for k := range rows[0] {
			headers = append(headers, k)
		}
		return rows, headers, nil
	}

	// Default to CSV
	reader := csv.NewReader(file)
	reader.LazyQuotes = true
	
	rawRows, err := reader.ReadAll()
	if err != nil {
		return nil, nil, err
	}
	if len(rawRows) < 2 {
		return nil, nil, errors.New("csv file too short")
	}

	headers := rawRows[0]
	// Remove Byte Order Mark (BOM) if present in first header
	if len(headers) > 0 {
		headers[0] = strings.TrimPrefix(headers[0], "\ufeff")
	}

	var result []map[string]interface{}
	for _, r := range rawRows[1:] {
		rowMap := make(map[string]interface{})
		for i, val := range r {
			if i < len(headers) {
				rowMap[headers[i]] = val
			}
		}
		result = append(result, rowMap)
	}
	return result, headers, nil
}

func standardizeData(rows []map[string]interface{}, mapping map[string]string, schema *CanonicalSchema) []map[string]interface{} {
	var standardizedRows []map[string]interface{}

	for _, rawRow := range rows {
		cleanRow := make(map[string]interface{})
		for _, canonCol := range schema.Columns {
			sourceCol := mapping[canonCol]
			if sourceCol != "" {
				if val, exists := rawRow[sourceCol]; exists {
					cleanRow[canonCol] = val
				} else {
					cleanRow[canonCol] = nil
				}
			} else {
				cleanRow[canonCol] = nil
			}
		}
		standardizedRows = append(standardizedRows, cleanRow)
	}
	return standardizedRows
}

// --- 5. The Handler (Uses dbPool from main.go) ---

func handleSmartUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	r.ParseMultipartForm(10 << 20) // 10MB limit

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving file: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Parse
	rawRows, rawHeaders, err := parseFile(file, header.Filename)
	if err != nil {
		http.Error(w, "Error parsing file: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Detect
	detectedSchema, err := detectSchema(rawHeaders)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnprocessableEntity)
		return
	}

	// Map & Clean
	mapping := buildColumnMapping(detectedSchema, rawHeaders)
	cleanRows := standardizeData(rawRows, mapping, detectedSchema)

	// Database Insert
	ctx := context.Background()
	tx, err := dbPool.Begin(ctx)
	if err != nil {
		http.Error(w, "DB Error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)

	uploadID := int(time.Now().Unix()) // Simple ID generation
	
	// Create Batch
	batch := &pgx.Batch{}
	sql := fmt.Sprintf("INSERT INTO %s (upload_id, data) VALUES ($1, $2)", detectedSchema.TableName)

	for _, row := range cleanRows {
		jsonData, err := json.Marshal(row)
		if err != nil {
			continue
		}
		batch.Queue(sql, uploadID, jsonData)
	}

	br := tx.SendBatch(ctx, batch)
	_, err = br.Exec()
	if err != nil {
		br.Close()
		http.Error(w, "Batch Insert Failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	br.Close()

	if err := tx.Commit(ctx); err != nil {
		http.Error(w, "Commit Failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Success Response
	response := map[string]interface{}{
		"status":          "success",
		"detected_table":  detectedSchema.TableName,
		"rows_processed":  len(cleanRows),
		"columns_mapped":  mapping,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

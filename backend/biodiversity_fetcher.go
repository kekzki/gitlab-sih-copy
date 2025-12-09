package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"
    
    // Assumed dependency used in your main.go
	"github.com/jackc/pgx/v5/pgxpool"
)

// MetricKeyMap defines the key transformation from DB source to Frontend target.
// Note: This must be accessible to the main package.
var MetricKeyMap = map[string]string{
	"Species Richness (S)": "species_richness",
	"Shannon Index (H')":   "shannon_index",
	"Simpson Index (D)":    "simpson_index",
	"Evenness (E)":         "evenness",
	"Functional Diversity": "functional_diversity",
	"Taxonomic Diversity":  "taxonomic_diversity",
}

// DataPoint represents a single processed row with mapped keys.
type DataPoint = map[string]interface{}

// fetchBiodiversityMetrics fetches, filters, and processes biodiversity metrics.
// It requires the global 'dbPool' to be initialized with the target URL: 
// postgres://user:somepass@localhost:5430/myappdb
func fetchBiodiversityMetrics(
	pool *pgxpool.Pool, // Expects the initialized global dbPool
	region string,      // Mandatory filter
	year int,           // Mandatory filter
) ([]DataPoint, error) {

	// Check if the pool is initialized (this pool was created in main.go with the DB URL)
	if pool == nil {
		return nil, fmt.Errorf("database pool dependency is nil. Ensure dbPool is initialized in main.go")
	}

	ctx := context.Background()

	// 1. Build SQL Query
	query := `
        SELECT 
            id, region, data
        FROM 
            species_diversity 
        WHERE 
            region = $1 
            AND (data->>'year')::int = $2
        ORDER BY id
    `
	params := []interface{}{region, year}

	// 2. Execute Query
	queryCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	rows, err := pool.Query(queryCtx, query, params...)
	if err != nil {
		log.Printf("❌ Database query failed for %s, %d: %v", region, year, err)
		return nil, fmt.Errorf("database query failed: %w", err)
	}
	defer rows.Close()

	// 3. Process Data and Map Keys
	var processedData []DataPoint

	for rows.Next() {
		var id int
		var rowRegion string
		var rawData []byte

		if err := rows.Scan(&id, &rowRegion, &rawData); err != nil {
			log.Printf("Error scanning row: %v\n", err)
			continue
		}

		var dataDict map[string]interface{}
		if err := json.Unmarshal(rawData, &dataDict); err != nil {
			log.Printf("Error unmarshaling JSON for ID %d: %v\n", id, err)
			continue
		}

		dataPoint := DataPoint{
			"id":     id,
			"region": rowRegion,
			"year":   dataDict["year"],
		}

		for label, key := range MetricKeyMap {
			value, exists := dataDict[key]
			if exists && value != nil {
				// Attempt to ensure value is numeric for charts if possible
				if f, ok := value.(float64); ok {
					dataPoint[label] = f
				} else if s, ok := value.(string); ok {
					var f float64
					if _, err := fmt.Sscanf(s, "%f", &f); err == nil {
						dataPoint[label] = f
					} else {
						dataPoint[label] = s
					}
				} else {
					dataPoint[label] = value
				}
			} else {
				dataPoint[label] = nil
			}
		}

		processedData = append(processedData, dataPoint)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during row iteration: %w", err)
	}
    
    log.Printf("✅ Successfully processed %d records for %s, %d.", len(processedData), region, year)

	return processedData, nil
}
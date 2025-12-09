package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// EnvHealthDataPoint represents a single processed data point for environmental charts.
type EnvHealthDataPoint = map[string]interface{}

// fetchEnvHealthData fetches and processes oceanographic data for environmental health charts.
// It filters by region and an optional date range.
func fetchEnvHealthData(
	pool *pgxpool.Pool,
	region string,
	startDate, endDate string, // Dates are strings in "YYYY-MM-DD" format
) ([]EnvHealthDataPoint, error) {

	if pool == nil {
		return nil, fmt.Errorf("database pool is not initialized")
	}

	// 1. Build SQL Query
	var queryBuilder strings.Builder
	queryBuilder.WriteString("SELECT id, region, data FROM oceanographic_data WHERE region = $1")

	params := []interface{}{region}
	argCount := 2 // Start next param index at 2

	if startDate != "" {
		queryBuilder.WriteString(fmt.Sprintf(" AND (data->>'eventdate')::date >= $%d", argCount))
		params = append(params, startDate)
		argCount++
	}
	if endDate != "" {
		queryBuilder.WriteString(fmt.Sprintf(" AND (data->>'eventdate')::date <= $%d", argCount))
		params = append(params, endDate)
		argCount++
	}

	queryBuilder.WriteString(" ORDER BY (data->>'eventdate')::date")

	// 2. Execute Query
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, queryBuilder.String(), params...)
	if err != nil {
		log.Printf("❌ Database query failed for env health data in region %s: %v", region, err)
		return nil, fmt.Errorf("database query failed: %w", err)
	}
	defer rows.Close()

	// 3. Process Data into a flat structure
	var processedData []EnvHealthDataPoint
	for rows.Next() {
		var id int
		var rowRegion string
		var rawData json.RawMessage

		if err := rows.Scan(&id, &rowRegion, &rawData); err != nil {
			log.Printf("Error scanning env health row: %v", err)
			continue
		}

		var dataDict map[string]interface{}
		if err := json.Unmarshal(rawData, &dataDict); err != nil {
			log.Printf("Error unmarshaling env health JSON for ID %d: %v", id, err)
			continue
		}

		// Add the primary columns
		dataDict["id"] = id
		dataDict["region"] = rowRegion

		processedData = append(processedData, dataDict)
	}

	return processedData, rows.Err()
}
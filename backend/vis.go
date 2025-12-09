// --- vis.go ---
package main

import (
    "context"
    "database/sql"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
    
    // Use the same pgx/v5 driver your upload.go uses
    "github.com/jackc/pgx/v5/pgxpool" 
    
    _ "github.com/lib/pq" // Required for database/sql, though pgx is used for pooling
)

// Global pool variable (must be defined in main.go)
var dbPool *pgxpool.Pool 

// ParamKeyMap (Used by the Go function to structure the output)
var ParamKeyMap = map[string]string{
	"pH Level":           "pHLevel",
	"Dissolved Oxygen":   "dissolvedOxygen_milligramsPerLiter",
	"CO2 Concentration":  "CO2_microatm",
	"Total Alkalinity":   "alkalinity_micromolPeriKilogram",
	"SST":                "SST_degreeCelcius",
	"Salinity":           "salinity_PSU",
	"Water Depth":        "minimumDepthInMeters",
	"Current Velocity":   "currentVelocity_metersPerSecond",
	"Nitrate":            "nitrate_micromolPerLitre",
	"Phosphate":          "phosphate_micromolPerLitre",
	"Silicate":           "silicate_micromolPerLitre",
}

type DataPoint = map[string]interface{}

// fetchOceanographicData is the core function to query the database.
func fetchOceanographicData(ctx context.Context, startDate string, region string) ([]DataPoint, error) {
    if dbPool == nil {
        return nil, errors.New("database pool is not initialized")
    }

    // Default to 2 years ago if start_date is missing
    if startDate == "" {
        startDate = time.Now().AddDate(-2, 0, 0).Format("2006-01-02")
    }

    // 1. Build SQL Query
    var query string
    params := []interface{}{startDate}

    query = `
        SELECT
            Data
        FROM
            oceanographic_data
        WHERE
            (Data->>'eventdate')::date >= $1::date
    `
    // Use pgx placeholder $2 for the second parameter
    if region != "" {
        query += " AND Region = $2"
        params = append(params, region)
    }

    query += " ORDER BY (Data->>'eventdate')::date ASC;"

    // 2. Execute Query
    rows, err := dbPool.Query(ctx, query, params...)
    if err != nil {
        return nil, fmt.Errorf("database query failed: %w", err)
    }
    defer rows.Close()

    // 3. Process Data
    processedData := make([]DataPoint, 0)

    for rows.Next() {
        var rawData []byte
        if err := rows.Scan(&rawData); err != nil {
            log.Printf("Error scanning row: %v\n", err)
            continue
        }

        var dataDict map[string]interface{}
        if err := json.Unmarshal(rawData, &dataDict); err != nil {
            log.Printf("Error unmarshaling JSON: %v\n", err)
            continue
        }
        
        // Structure the data point for the React frontend
        dataPoint := make(DataPoint)
        for k, v := range dataDict {
            dataPoint[k] = v // Include all original keys (like eventdate)
        }

        // Add 'date' key (for XAxis)
        dataPoint["date"] = dataDict["eventdate"]
        
        // Normalize keys and convert values to float
        for label, key := range ParamKeyMap {
            value, exists := dataDict[key]
            if exists && value != nil {
                if f, ok := value.(float64); ok {
                    dataPoint[label] = f
                } else if s, ok := value.(string); ok {
                    var f float64
                    if _, err := fmt.Sscanf(s, "%f", &f); err == nil {
                        dataPoint[label] = f
                    }
                }
            }
        }

        processedData = append(processedData, dataPoint)
    }
    
    return processedData, rows.Err()
}


// --- 4. The New API Handler for the React Component ---
func HandleOceanographicParameters(w http.ResponseWriter, r *http.Request) {
    // 1. CORS Setup (Essential for development)
    w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173") // Update port if your Vite/React server is different
    w.Header().Set("Access-Control-Allow-Methods", "GET")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

    if r.Method == "OPTIONS" {
        w.WriteHeader(http.StatusOK)
        return
    }
    
    // 2. Extract Filters
    query := r.URL.Query()
    startDate := query.Get("start_date")
    region := query.Get("region")

    // 3. Fetch Data
    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()
    
    data, err := fetchOceanographicData(ctx, startDate, region) 
    
    if err != nil {
        log.Printf("Error fetching oceanographic data: %v", err)
        http.Error(w, "Failed to retrieve data", http.StatusInternalServerError)
        return
    }

    // 4. Send Response
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}
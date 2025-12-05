package main

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"

	// Import the lib/pq driver - it registers itself with the database/sql package
	_ "github.com/lib/pq" 
)

// SpeciesInfo represents the specific data we want to extract from the species_data table.
type SpeciesInfo struct {
	ID             int
	ScientificName string
	IUCNStatus     string
	MaxWeightKG    int
}

func main() {
	// --- 1. CONFIGURE DATABASE CONNECTION USING ENVIRONMENT VARIABLES ---
	
	// Host, User, and DB Name are fixed based on your docker-compose.yml service definition.
	const (
		dbhost = "db"
		dbport = 5432
		dbuser = "user"
		dbname = "myappdb"
	)
	
	// Read the database password from the environment variable (best practice)
	dbpass := os.Getenv("DB_PASSWORD")
	if dbpass == "" {
		fmt.Fprintf(os.Stderr, "FATAL: DB_PASSWORD environment variable is not set.\n")
		os.Exit(1)
	}

	// lib/pq uses a simple connection string format
	connString := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		dbhost, dbport, dbuser, dbpass, dbname)

	// --- 2. ESTABLISH CONNECTION (using database/sql and lib/pq) ---
	db, err := sql.Open("postgres", connString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error opening database connection: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	// Verify the connection is alive
	err = db.Ping()
	if err != nil {
		// This failure often means wrong credentials or the 'db' host is unreachable/wrong.
		fmt.Fprintf(os.Stderr, "Unable to connect to database (check connection details/credentials): %v\n", err)
		os.Exit(1)
	}
	fmt.Println("Successfully connected to the database!")

	// --- 3. FETCH DATA ---
	speciesList, err := fetchSpeciesData(db)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error fetching species data: %v\n", err)
		os.Exit(1)
	}

	// --- 4. PRINT RESULTS ---
	if len(speciesList) == 0 {
		fmt.Println("\nNo species found for 'Thunnus'.")
	} else {
		fmt.Println("\n✅ Fetched Species Data (Genus: Thunnus):")
		for _, s := range speciesList {
			fmt.Printf("ID: %-3d | Scientific Name: %-20s | IUCN Status: %-15s | Max Weight: %d kg\n",
				s.ID, s.ScientificName, s.IUCNStatus, s.MaxWeightKG)
		}
	}
}

// fetchSpeciesData executes the SQL query and maps the results to the Go struct.
func fetchSpeciesData(db *sql.DB) ([]SpeciesInfo, error) {
	// Query to extract id and fields from the JSONB 'data' column
	query := `
		SELECT
			id,
			data ->> 'scientific_name',
			data ->> 'iucn_status',
			data ->> 'max_weight_kg'
		FROM
			species_data
		WHERE
			data ->> 'genus' = $1
	`
	
	rows, err := db.Query(query, "Thunnus")
	if err != nil {
		return nil, fmt.Errorf("error executing query: %w", err)
	}
	defer rows.Close()

	var speciesList []SpeciesInfo

	for rows.Next() {
		var s SpeciesInfo
		var maxWeightStr string 

		if err := rows.Scan(&s.ID, &s.ScientificName, &s.IUCNStatus, &maxWeightStr); err != nil {
			return nil, fmt.Errorf("error scanning row: %w", err)
		}

		// Convert the string-read JSON value for MaxWeight into an integer
		s.MaxWeightKG, err = strconv.Atoi(maxWeightStr)
		if err != nil {
			// A warning is useful here if we can't parse a number
			fmt.Printf("Warning: Could not convert max_weight_kg '%s' to int for ID %d: %v\n", maxWeightStr, s.ID, err)
			s.MaxWeightKG = 0
		}

		speciesList = append(speciesList, s)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during row iteration: %w", err)
	}

	return speciesList, nil
}
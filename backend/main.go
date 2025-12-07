package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"time" // Imported for sleep

	"github.com/jackc/pgx/v5/pgxpool"
)

var dbPool *pgxpool.Pool

// ... (Structs remain the same) ...
type Species struct {
	SpeciesID int             `json:"species_id"`
	UploadID  int             `json:"upload_id"`
	Data      json.RawMessage `json:"data"`
}
// (Include other structs here if needed, omitted for brevity)

// --- Main ---

func main() {
	// HARDCODED DATABASE URL
	dbURL := "postgres://user:mysecretpassword@db:5432/myappdb?sslmode=disable"

	var err error
	
	// --- FIX: RETRY LOOP FOR DATABASE CONNECTION ---
	maxRetries := 15
	for i := 0; i < maxRetries; i++ {
		log.Printf("Connecting to database (Attempt %d/%d)...", i+1, maxRetries)
		
		// Try to create pool
		dbPool, err = pgxpool.New(context.Background(), dbURL)
		if err == nil {
			// Try to ping
			err = dbPool.Ping(context.Background())
			if err == nil {
				log.Println("✅ Successfully connected to database!")
				break // Success! Exit loop
			}
		}
		
		log.Printf("Database not ready yet (%v). Waiting 2 seconds...", err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatal("❌ Could not connect to database after multiple retries. Exiting.")
	}
	defer dbPool.Close()
	// -----------------------------------------------

	// Routes
	http.HandleFunc("/api/species", getSpecies)
    http.HandleFunc("/api/analyze-image", handleAnalyzeImage)
    // (Add other routes back)

	log.Println("🚀 Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(http.DefaultServeMux)))
}

// ... (Keep the rest of your handler functions: enableCORS, handleAnalyzeImage, getSpecies) ...
// Copy them from the previous working code I gave you.

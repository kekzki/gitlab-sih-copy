package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
)

func main() {
	// Try DATABASE_URL first (same behavior as main.go)
	dbURL := os.Getenv("DATABASE_URL")

	if dbURL == "" {
		// Fallback exactly like main.go
		DB_HOST := getEnv("DB_HOST", "localhost")
		DB_PORT := getEnv("DB_PORT", "5432")
		DB_USER := getEnv("DB_USER", "postgres")
		DB_PASS := os.Getenv("DB_PASSWORD")
		DB_NAME := getEnv("DB_NAME", "postgres")

		if DB_PASS == "" {
			log.Fatal("❌ ERROR: DB_PASSWORD or DATABASE_URL must be set")
		}

		dbURL = fmt.Sprintf(
			"postgres://%s:%s@%s:%s/%s?sslmode=disable",
			DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME,
		)
	}

	fmt.Println("Connecting using URL:", dbURL)
	fmt.Println("Attempting to connect to PostgreSQL...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	conn, err := pgx.Connect(ctx, dbURL)
	if err != nil {
		log.Fatalf("❌ Connection failed: %v\n", err)
	}
	defer conn.Close(ctx)

	fmt.Println("✅ Connection established successfully.")
	log.Println("DEBUG: Connecting using URL:", dbURL)
	fmt.Println("Fetching list of tables...")

	query := `
		SELECT table_name 
		FROM information_schema.tables
		WHERE table_schema = 'public'
		ORDER BY table_name;
	`

	rows, err := conn.Query(ctx, query)
	if err != nil {
		log.Fatalf("❌ Failed to fetch tables: %v\n", err)
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var table string
		if err := rows.Scan(&table); err != nil {
			log.Fatalf("Error scanning table: %v\n", err)
		}
		tables = append(tables, table)
	}

	if len(tables) == 0 {
		fmt.Println("⚠️ No tables found in schema 'public'.")
	} else {
		fmt.Println("\n📌 Tables in 'public' schema:")
		for _, t := range tables {
			fmt.Println(" -", t)
		}
	}

	fmt.Println("\nConnection closed.")
}

func getEnv(key, defaultValue string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultValue
}

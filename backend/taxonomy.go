package main

import (
    "context"
    "fmt"
    "github.com/jackc/pgx/v5"
)

func taxonomyCardInfo(dbURL string, speciesID int) (map[string]interface{}, error) {
    ctx := context.Background()

    // Connect to PostgreSQL
    conn, err := pgx.Connect(ctx, dbURL)
    if err != nil {
        fmt.Println("❌ Database connection failed:", err)
        return nil, err
    }
    fmt.Println("✅ Connected to PostgreSQL")
    defer conn.Close(ctx)

    // Query
    var rowData map[string]interface{}

    err = conn.QueryRow(ctx,
        "SELECT * FROM species_data WHERE species_id=$1",
        speciesID,
    ).Scan(
        new(interface{}),     // column 1 (ignored)
        new(interface{}),     // column 2 (ignored)
        &rowData,             // column 3 → JSONB → map[string]interface{}
    )

    if err != nil {
        fmt.Println("❌ Query failed:", err)
        return nil, err
    }

    fmt.Println(rowData)

    // Build return object
    result := map[string]interface{}{
        "diet":                     rowData["diet"],
        "class":                    rowData["class"],
        "genus":                    rowData["genus"],
        "order":                    rowData["order"],
        "family":                   rowData["family"],
        "phylum":                   rowData["phylum"],
        "kingdom":                  rowData["kingdom"],
        "species":                  rowData["species"],
        "longevity":                rowData["longevity"],
        "sex_ratio":                rowData["sex_ratio"],
        "fecundity":                rowData["fecundity"],

        // image_urls[0]
        "image_urls": func() interface{} {
            arr, ok := rowData["image_urls"].([]interface{})
            if ok && len(arr) > 0 {
                return arr[0]
            }
            return nil
        }(),

        "habitat_type":             rowData["habitat_type"],
        "O2_efficiency":            rowData["O2_efficiency"],
        "max_length_cm":            rowData["max_length_cm"],
        "max_weight_kg":            rowData["max_weight_kg"],
        "trophic_level":            rowData["trophic_level"],
        "endemic_status":           rowData["endemic_status"],
        "metabolic_rate":           rowData["metabolic_rate"],
        "migration_type":           rowData["migration_type"],
        "mortality_rate":           rowData["mortality_rate"],
        "vernacularName":           rowData["vernacularName"],
        "metamorphosis_timing":     rowData["metamorphosis_timing"],
        "larval_duration":          rowData["larval_duration"],
        "larval_survival":          rowData["larval_survival"],
        "scientific_name":          rowData["scientific_name"],
        "spawning_season":          rowData["spawning_season"],
        "diet_composition":         rowData["diet_composition"],
        "habitat_preference":       rowData["habitat_preference"],
        "salinity_tolerance":       rowData["salinity_tolerance"],
        "age_of_maturity_years":    rowData["age_of_maturity_years"],

        // temperature_range_min + "-" + temperature_range_max
        "temperature_tolerance": func() string {
            tmin, _ := rowData["temperature_range_min"].(string)
            tmax, _ := rowData["temperature_range_max"].(string)
            return tmin + "-" + tmax
        }(),

        "preferred_salinity_max":   rowData["preferred_salinity_max"],
        "preferred_salinity_min":   rowData["preferred_salinity_min"],
    }

    return result, nil
}

// classification (family, order, class), iucn_status, regions




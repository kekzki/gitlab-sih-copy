import psycopg2

def taxonomyCardInfo(species_id, db_url="postgres://user:somepass@localhost:5430/myappdb"):
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = False
        cur = conn.cursor()
        print("✅ Connected to PostgreSQL")
    except Exception as e:
        print("❌ Database connection failed:", e)
        return -1
    
    cur.execute("select * from species_data where species_id=%s", (species_id,))
    row = cur.fetchone()[2]
    print(row)
    return {
    "diet": row["diet"],
    "class": row["class"],
    "genus": row["genus"],
    "order": row["order"],
    "family": row["family"],
    "phylum": row["phylum"],
    "kingdom": row["kingdom"],
    "species": row["species"],
    "longevity": row["longevity"],
    "sex_ratio": row["sex_ratio"],
    "fecundity": row["fecundity"],
    "image_urls": row["image_urls"][0],
    "habitat_type": row["habitat_type"],

    "O2_efficiency": row["O2_efficiency"],
    "max_length_cm": row["max_length_cm"],
    "max_weight_kg": row["max_weight_kg"],
    "trophic_level": row["trophic_level"],
    "endemic_status": row["endemic_status"],
    "metabolic_rate": row["metabolic_rate"],
    "migration_type": row["migration_type"],
    "mortality_rate": row["mortality_rate"],
    "vernacularName": row["vernacularName"],
    "metamorphosis_timing": row["metamorphosis_timing"],
    "larval_duration": row["larval_duration"],
    "larval_survival": row["larval_survival"],
    "scientific_name": row["scientific_name"],
    "spawning_season": row["spawning_season"],
    "diet_composition": row["diet_composition"],
    "habitat_preference": row["habitat_preference"],
    "salinity_tolerance": row["salinity_tolerance"],
    "age_of_maturity_years": row["age_of_maturity_years"],
    "temperature_tolerance": row["temperature_range_min"]+"-"+row["temperature_range_max"],
    "preferred_salinity_max": row["preferred_salinity_max"],
    "preferred_salinity_min": row["preferred_salinity_min"],
}


# classification (family, order, class), iucn_status, regions
# Least Concern, Vulnerable, Near Threatened, Endangered, Critically Endangered
# Andaman and Nicobar, Andhra Pradesh coast, Arabian Sea, Bay of Bengal, Goa coast, Gujarat coast, Indian Ocean, Karnataka coast, Kerala coast, Lakshadweep, Odisha, Tamil Nadu coast, West Bengal, Maharashtra coast
import psycopg2

def taxonomy_filter2cards_info(iucn_filters, region_filters, db_url="postgres://user:somepass@localhost:5430/myappdb"):
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        print("✅ Connected to PostgreSQL")
    except Exception as e:
        print("❌ Database connection failed:", e)
        return -1

    base_query = "SELECT species_id FROM species_data"
    where_clauses = []
    params = []

    # ---------------------------------------------
    # IUCN FILTERS (inside JSONB)
    # OR logic → iucn_status IN (...)
    # ---------------------------------------------
    if iucn_filters:
        where_clauses.append("(data->>'iucn_status') = ANY(%s)")
        params.append(iucn_filters)

    # ---------------------------------------------
    # REGION FILTERS (inside JSONB reported_regions array)
    # OR logic → match ANY provided region
    # ---------------------------------------------
    if region_filters:
        where_clauses.append("(data->'reported_regions')::jsonb ?| %s")
        params.append(region_filters)

    # ---------------------------------------------
    # Combine filters
    # BOTH present → AND
    # ONE present → only that
    # ---------------------------------------------
    if where_clauses:
        final_query = base_query + " WHERE " + " AND ".join(where_clauses)
    else:
        final_query = base_query  # no filters → return all rows

    print("📌 Final Query:", final_query)
    print("📌 Params:", params)

    # Execute
    cur.execute(final_query, params)
    rows = cur.fetchall()

    species_ids = [r[0] for r in rows]
    return species_ids

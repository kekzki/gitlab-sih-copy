from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# --- EXISTING MODEL PATH (Keep this) ---
# This assumes you copied the 'experiments' folder into the container during build
MODEL_PATH = BASE_DIR / "experiments" / "oto_segnet_v1" / "checkpoints" / "best_model.pth"

# --- CRITICAL FIXES FOR DOCKER VOLUMES ---
# 1. Save results to the Shared Volume so Go can see them
# This matches the 'shared_images:/app/batch_results' line in docker-compose.yml
RESULTS_DIR = Path("/app/batch_results")

# 2. Save temporary uploads to a dedicated Linux temp folder
UPLOAD_DIR = Path("/app/temp_uploads")

SCALE_FACTOR = 10.0  # pixels per mm

SPECIES_MAP = {
    0: "Lophiodes lugubris",
    1: "Malthopsis lutea",
    2: "Chaunax multilepis",
    3: "Halieutaea coccinea",
    4: "Chaunax apus",
}
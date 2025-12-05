from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_PATH = BASE_DIR / "experiments" / "oto_segnet_v1" / "checkpoints" / "best_model.pth"
RESULTS_DIR = BASE_DIR / "results"
UPLOAD_DIR = BASE_DIR / "temp_uploads"

SCALE_FACTOR = 10.0  # pixels per mm

SPECIES_MAP = {
    0: "Lophiodes lugubris",
    1: "Malthopsis lutea",
    2: "Chaunax multilepis",
    3: "Halieutaea coccinea",
    4: "Chaunax apus",
}

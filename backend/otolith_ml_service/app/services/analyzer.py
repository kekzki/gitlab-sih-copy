# app/services/analyzer.py
from typing import Dict
from pathlib import Path

from app.core.config import MODEL_PATH, RESULTS_DIR, SCALE_FACTOR, SPECIES_MAP
from ml_pipeline.batch_analysis import BatchOtolithAnalyzer


class OtolithServiceAnalyzer:
    def __init__(self) -> None:
        RESULTS_DIR.mkdir(parents=True, exist_ok=True)

        self._analyzer = BatchOtolithAnalyzer(
            model_path=str(MODEL_PATH),
            species_map=SPECIES_MAP,
            scale_factor=SCALE_FACTOR,
        )

    def analyze_image(self, image_path: str) -> Dict:
        result = self._analyzer.analyze_single(
            image_path=image_path,
            save_dir=str(RESULTS_DIR),
        )

        out = result.copy()
        if "output_files" in out:
            out["output_files"] = {
                k: Path(v).name for k, v in out["output_files"].items()
            }
        return out

analyzer_service = OtolithServiceAnalyzer()

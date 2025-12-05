# app/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from pathlib import Path
import shutil

from app.core.config import UPLOAD_DIR
from app.services.analyzer import analyzer_service

app = FastAPI(title="Otolith ML Service", version="1.0.0")


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = UPLOAD_DIR / file.filename

    with temp_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = analyzer_service.analyze_image(str(temp_path))
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    finally:
        if temp_path.exists():
            temp_path.unlink()

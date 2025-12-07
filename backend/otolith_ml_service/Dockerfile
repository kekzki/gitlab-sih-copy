# /backend/otolith_ml_service/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# FIX: Use 'libgl1' and 'libglib2.0-0' instead of the deprecated 'libgl1-mesa-glx'
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Match port in docker-compose
EXPOSE 8000

# Start command
# Adjust 'test_ml_service:app' if your python file/app name is different
CMD ["uvicorn", "test_ml_service:app", "--host", "0.0.0.0", "--port", "8000"]

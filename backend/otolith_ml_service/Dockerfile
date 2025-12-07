FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# FIX: We explicitely install 'requests' here.
# If your file doesn't have this exact line, Docker won't fix the error.
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir requests python-multipart uvicorn fastapi

COPY . .

EXPOSE 8000

CMD ["uvicorn", "test_ml_service:app", "--host", "0.0.0.0", "--port", "8000"]

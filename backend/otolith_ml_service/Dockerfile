FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# FIX: Explicitly install requests and python-multipart to prevent crashes
RUN pip install --no-cache-dir -r requirements.txt && pip install requests python-multipart

COPY . .

EXPOSE 8000

# Ensure we bind to 0.0.0.0 so Docker can see it
CMD ["uvicorn", "test_ml_service:app", "--host", "0.0.0.0", "--port", "8000"]


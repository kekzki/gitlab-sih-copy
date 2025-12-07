# otolith_ml_service/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies (for OpenCV/image processing if needed)
RUN apt-get update && apt-get install -y libgl1-mesa-glx

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the ML code
COPY . .

# Expose the port
EXPOSE 8000

# Start FastAPI (Assuming your main file is named main.py and app instance is 'app')
# If your file is named differently, change 'main:app' to 'filename:app'
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

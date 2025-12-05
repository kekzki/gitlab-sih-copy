# test_ml_service.py
import requests

url = "http://localhost:8000/analyze"
file_path = r"E:\otolith_analysis\data\images\otolith_027.jpg"  # path you know exists

with open(file_path, "rb") as f:
    files = {"file": (file_path, f, "image/jpeg")}
    resp = requests.post(url, files=files)

print("Status:", resp.status_code)
print("JSON:")
print(resp.json())

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from PIL import Image
import random
import time

app = FastAPI(title="AgrAI Python Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "AgrAI FastAPI Engine is Running"}

@app.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...)):
    # Read image
    contents = await file.read()
    try:
        # Validate it's a valid image (Mocking preprocessing step)
        image = Image.open(BytesIO(contents))
        image.verify()  # Check if it is an image
    except Exception as e:
        return {"error": "Invalid image format uploaded."}
    
    # Simulate processing delay
    time.sleep(1)

    # Mock predictions
    diseases = [
        {"disease": "Early Blight", "remedy": "Apply Mancozeb or Copper-based fungicides. Remove affected leaves."},
        {"disease": "Late Blight", "remedy": "Apply Chlorothalonil. Avoid overhead watering."},
        {"disease": "Healthy", "remedy": "Maintain current fertilizer schedules and water levels."},
        {"disease": "Leaf Mold", "remedy": "Improve air circulation. Apply fungicides labeled for leaf mold."},
        {"disease": "Nitrogen Deficiency", "remedy": "Apply urea or an N-rich balanced fertilizer."}
    ]
    
    prediction = random.choice(diseases)
    confidence = round(random.uniform(75.5, 99.8), 2)
    
    return {
        "disease": prediction["disease"],
        "confidence": confidence,
        "remedy": prediction["remedy"]
    }

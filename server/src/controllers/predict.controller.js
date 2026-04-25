const axios = require('axios');
const FormData = require('form-data');
const { admin, initialized } = require('../firebaseAdmin');

// Optional helper to log data to Firebase
async function logToFirebase(collectionName, data) {
  if (initialized) {
    try {
      await admin.firestore().collection(collectionName).add({
        ...data,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.error("[Firebase] Log error: ", err.message);
    }
  }
}

exports.predictDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    // Prepare multipart form data for Python Engine
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    // Call Python AI Service
    // Note: Assuming Python FastAPI will run on port 8000
    const pythonEndpoint = process.env.AI_ENGINE_URL || 'http://localhost:8000/predict/disease';
    
    const response = await axios.post(pythonEndpoint, formData, {
      headers: { ...formData.getHeaders() }
    });

    const result = response.data;

    // Log to Firebase
    await logToFirebase('disease_predictions', {
      disease: result.disease,
      confidence: result.confidence,
      filename: req.file.originalname
    });

    res.json(result);
  } catch (error) {
    console.error('[Predict Disease Error]', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to process disease prediction.' });
  }
};

exports.predictCrop = async (req, res) => {
  try {
    const { soilType, temperature, rainfall } = req.body;
    
    // Abstract ML logic / dummy response for crop prediction
    let recommendation = "Wheat";
    if (temperature > 25 && rainfall > 100) recommendation = "Rice";
    if (soilType === "Sandy" && rainfall < 50) recommendation = "Millet";

    const data = { recommendedCrop: recommendation, inputs: { soilType, temperature, rainfall } };
    await logToFirebase('crop_predictions', data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Crop prediction failed.' });
  }
};

exports.predictRisk = async (req, res) => {
  try {
    const { humidity, temperature, weatherStatus } = req.body;
    
    let riskLevel = "LOW";
    let action = "Continue optimal irrigation.";

    if (temperature > 35 && humidity < 30) {
      riskLevel = "HIGH";
      action = "Heatwave and drought risk. Increase irrigation immediately.";
    } else if (weatherStatus && weatherStatus.toLowerCase().includes('storm')) {
      riskLevel = "CRITICAL";
      action = "Storm approaching. Ensure proper drainage and secure assets.";
    }

    const data = { riskLevel, action, conditions: { humidity, temperature, weatherStatus } };
    await logToFirebase('risk_assessments', data);

    // If High risk, simulate FCM Notification Trigger
    if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
      if (initialized) {
        // Mock FCM push
        console.log(`[Firebase FCM] Pushing ALERT: ${action}`);
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Risk prediction error.' });
  }
};

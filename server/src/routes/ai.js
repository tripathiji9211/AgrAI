const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

let genAI = null;

// Initialize the SDK if the key is available
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!genAI) {
      setTimeout(() => {
        let text = "I am your AgrAI assistant. I can analyze recent telemetry, weather patterns, and crop disease vectors for your farm.";
        const msgLow = message.toLowerCase();
        
        if (msgLow.includes('disease') || msgLow.includes('sick') || msgLow.includes('pest')) {
          text = "It looks like your crop might be facing a biological threat. Please navigate to the Farm Map or Disease Tracker and upload a leaf image so our AI Engine can classify it.";
        } else if (msgLow.includes('weather') || msgLow.includes('rain') || msgLow.includes('water')) {
          text = "Heavy rainfall is predicted over the next 72 hours. Our predictive risk models recommend delaying any fertilizer application to prevent nutrient runoff.";
        } else if (msgLow.includes('npk') || msgLow.includes('fertilizer') || msgLow.includes('soil')) {
          text = "For optimal yield in Loamy soil, aim for an NPK ratio of 4:2:1. Based on your live telemetry, your nitrogen levels are moderately healthy.";
        } else if (msgLow.includes('hello') || msgLow.includes('hi')) {
          text = "Hello! Welcome to AgrAI. How can I assist you with your farming operations today?";
        }

        res.json({ response: text });
      }, 800);
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    res.json({ response: text });
  } catch (error) {
    console.error('[Predict Disease Error]', error.response?.data || error.message || error);
    
    let userFriendlyError = 'Failed to generate content.';
    if (error.status === 404) {
      userFriendlyError = 'Gemini Model not found or API key is restricted. Please check your GEMINI_API_KEY in the .env file.';
    } else if (error.status === 400 || error.status === 403) {
      userFriendlyError = 'Invalid GEMINI_API_KEY. Please verify your .env file.';
    } else if (error.message) {
      userFriendlyError = `AI Error: ${error.message}`;
    }

    res.status(500).json({ error: userFriendlyError });
  }
});

module.exports = router;

const { admin, initialized } = require('../firebaseAdmin');
// We can use the existing Gemini instance initialized in ai.js, or re-instantiate:
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

exports.processVoiceQuery = async (req, res) => {
  try {
    const { transcript, languageCode } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: "Transcript is missing." });
    }

    // Log Query to Firebase
    if (initialized) {
      await admin.firestore().collection('voice_queries').add({
        transcript,
        languageCode,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Route Intent using Gemini
    let responseText = "I received your voice command, but the AI module is offline.";
    
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are an intelligent Agricultural assistant. 
        User Query (may be in English/Hindi/regional language): "${transcript}"
        Determine the intent. Try to provide a short, helpful agronomic response. If it's a disease question, suggest they use the disease detector image tool.
        Keep it concise. Responding Language should match the query's language if possible (locale: ${languageCode}).
      `;
      const result = await model.generateContent(prompt);
      responseText = await result.response.text();
    } else {
      // Mock Intent routing
      const msgLow = transcript.toLowerCase();
      if (msgLow.includes('disease') || msgLow.includes('sick')) {
        responseText = "I detected a disease query. Navigating you to the disease detection tool for computer vision analysis.";
      } else if (msgLow.includes('weather') || msgLow.includes('risk') || msgLow.includes('rain')) {
        responseText = "Checking predictive risk algorithms regarding incoming weather conditions. Please check your Dashboard for high-risk FCM alerts.";
      } else if (msgLow.includes('soil') || msgLow.includes('fertilizer')) {
        responseText = "Accessing soil telemetry. Your latest Moisture levels and Nitrogen rates are visualized on the main dashboard.";
      } else {
        responseText = "Voice command received. I am analyzing the agronomical context.";
      }
    }

    res.json({ response: responseText, intentMatched: true });
  } catch (error) {
    console.error("[Voice Controller Error]", error.status, error.message);
    let userFriendlyError = "Failed to process voice query.";
    if (error.status === 404 || error.status === 403 || error.status === 400) {
      userFriendlyError = "Voice intent failed due to invalid GEMINI_API_KEY. Please check your .env configuration.";
    }
    res.status(500).json({ error: userFriendlyError });
  }
};

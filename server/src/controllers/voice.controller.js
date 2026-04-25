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
      if (transcript.toLowerCase().includes('disease')) {
        responseText = "Navigating you to the disease detection tool.";
      } else if (transcript.toLowerCase().includes('weather') || transcript.toLowerCase().includes('risk')) {
        responseText = "Checking predictive risk algorithms.";
      }
    }

    res.json({ response: responseText, intentMatched: true });
  } catch (error) {
    console.error("[Voice Controller Error]", error.message);
    res.status(500).json({ error: "Failed to process voice query." });
  }
};

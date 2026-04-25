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
      // Return a simulated response if no key is present (useful for prototyping)
      setTimeout(() => {
        res.json({ response: "This is a simulated AI response. Please add a valid GEMINI_API_KEY to your .env file to enable actual AI capabilities." });
      }, 500);
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    res.json({ response: text });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate content.' });
  }
});

module.exports = router;

const express = require('express');
const { admin, initialized } = require('../firebaseAdmin');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { lat, lng, userId } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and Longitude are required." });
    }

    const locationData = {
      lat,
      lng,
      userId: userId || 'anonymous_user',
      timestamp: initialized ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    if (initialized) {
      await admin.firestore().collection('locations').add(locationData);
    }

    res.json({ success: true, message: "Farm location stored successfully.", data: locationData });
  } catch (error) {
    console.error("[Location API Error]", error.message);
    res.status(500).json({ error: "Failed to store user location." });
  }
});

module.exports = router;

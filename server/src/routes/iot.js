const express = require('express');
const router = express.Router();

// Simulated memory storage for IoT Data
const telemetryData = [];

router.post('/stream', (req, res) => {
  const { deviceId, temperature, moisture, nitrogen, timestamp } = req.body;
  
  // Here, we would ideally stream this into BigQuery or a Pub/Sub topic
  const payload = { deviceId, temperature, moisture, nitrogen, timestamp };
  telemetryData.push(payload);
  
  // Keep only latest 100 to prevent memory leak in this mock simulation
  if (telemetryData.length > 100) {
    telemetryData.shift();
  }
  
  console.log(`[IoT Stream]: Received payload from ${deviceId}`);
  res.status(200).json({ success: true, message: 'Data ingested successfully.' });
});

router.get('/latest', (req, res) => {
  res.json({ data: telemetryData.slice(-10) });
});

module.exports = router;

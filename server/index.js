const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin (Requires GOOGLE_APPLICATION_CREDENTIALS)
require('./src/firebaseAdmin');

const aiRoutes = require('./src/routes/ai');
const iotRoutes = require('./src/routes/iot');
const predictRoutes = require('./src/routes/predict');
const voiceRoutes = require('./src/routes/voice');
const locationRoutes = require('./src/routes/location');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/ai', aiRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/location', locationRoutes);

app.get('/', (req, res) => {
  res.send('AgrAI Backend Service is running.');
});

app.listen(PORT, () => {
  console.log(`AgrAI server listening on port ${PORT}`);
});

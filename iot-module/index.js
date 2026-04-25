const axios = require('axios');

const API_URL = 'http://localhost:5000/api/iot/stream';
const DEVICE_ID = 'agri-sensor-001';

console.log(`Starting IoT Telemetry simulation for device: ${DEVICE_ID}`);

function generateTelemetry() {
  return {
    deviceId: DEVICE_ID,
    temperature: (20 + Math.random() * 15).toFixed(2), // 20 to 35 C
    moisture: (30 + Math.random() * 40).toFixed(2),    // 30 to 70 %
    nitrogen: (40 + Math.random() * 20).toFixed(2),    // 40 to 60 mg/kg
    timestamp: new Date().toISOString()
  };
}

setInterval(async () => {
  const data = generateTelemetry();
  try {
    await axios.post(API_URL, data);
    console.log(`[Sent] Temp: ${data.temperature}°C | Moisture: ${data.moisture}%`);
  } catch (err) {
    console.error('[Error] Failed to send telemetry data to server.');
  }
}, 5000); // simulate sending data every 5 seconds

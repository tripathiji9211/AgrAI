const admin = require("firebase-admin");

// Initialize Firebase Admin with Application Default Credentials
// You should set GOOGLE_APPLICATION_CREDENTIALS environment variable
// pointing to your Firebase Admin SDK service account JSON file.

let initialized = false;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    initialized = true;
    console.log('[Firebase Admin] Initialized successfully.');
  }
} catch (error) {
  console.log('[Firebase Admin] Initialization skipped or failed (service account missing).', error.message);
}

module.exports = { admin, initialized };

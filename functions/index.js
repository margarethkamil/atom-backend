/**
 * Cloud Functions for Firebase - Atom Backend
 * V2 functions with Express
 */

// Import the functions v2 libraries
const functions = require("firebase-functions/v2");
const logger = functions.logger;

// Set production environment for the app
process.env.NODE_ENV = "production";

// Import Express app - but don't invoke listen()
const expressApp = require("../dist/server").default;

// Export the function with the Express app
exports.api = functions.https.onRequest({
  region: "us-central1",
  memory: "256MiB",
  concurrency: 80,
  minInstances: 0,
  maxInstances: 10,
  timeoutSeconds: 60
}, expressApp);

logger.info("Firebase Function v2 initialized for Atom Backend");

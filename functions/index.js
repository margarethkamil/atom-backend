/**
 * Cloud Functions for Firebase - Atom Backend
 * V2 functions with Express - Direct approach
 */

// Import functions v2 libraries
const functions = require("firebase-functions/v2");
const logger = functions.logger;

// Set production environment for the app
process.env.NODE_ENV = "production";

// For v2, both approaches work:
// 1. Import the module which will start the server itself
require("../dist/server");

// 2. Export a function that Cloud Run can use as an entry point
// This function will be registered but not actually invoked
// because the server is already handling requests
exports.api = functions.https.onRequest({
  region: "us-central1",
  memory: "256MiB",
  concurrency: 80,
  minInstances: 0,
  maxInstances: 10,
  timeoutSeconds: 60
}, (req, res) => {
  // This is just a fallback and shouldn't be called
  // The actual server is running on port 8080
  res.status(200).send("API is running");
});

logger.info("Firebase Function v2 initialized - Express server should be listening on PORT");

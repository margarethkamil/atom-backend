/**
 * Cloud Functions for Firebase - Atom Backend
 * This file imports the Express app from the src directory and exposes it as
 * a Cloud Function
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Set production environment for the app
process.env.NODE_ENV = "production";

// DO NOT import the Express app directly for Cloud Functions v2
// Instead, we'll use the server module that starts the Express app correctly
require("../dist/server");

// Export a dummy function that will never be called
// The actual server is started by the server.js module
exports.api = onRequest({
  region: "us-central1",
  memory: "256MiB",
  minInstances: 0,
  maxInstances: 10
}, (req, res) => {
  // This function will never be called because the Express app
  // is already listening on PORT and handling requests directly
  res.status(200).send("This should never be called");
});

logger.info("Firebase Function v2 initialized for Atom Backend");

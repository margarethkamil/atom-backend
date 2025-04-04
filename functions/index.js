/**
 * Cloud Functions for Firebase - Atom Backend
 * This file imports the Express app from the src directory and exposes it as a Cloud Function
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Set production environment for the app
process.env.NODE_ENV = 'production';

// This path uses the directory structure from your project
// It points to the compiled JavaScript file
const app = require("../dist/server").default;

// Export the Express API as a Cloud Function
exports.api = onRequest({
  cors: true,
  maxInstances: 10,
  memory: "512MiB",
  timeoutSeconds: 60
}, app);

logger.info("Firebase Function initialized for Atom Backend");

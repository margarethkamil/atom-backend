/**
 * Cloud Functions for Firebase - Atom Backend
 * This file imports the Express app from the src directory and exposes it as
 * a Cloud Function
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Set production environment for the app
process.env.NODE_ENV = "production";

// Import Express app
const expressApp = require("../dist/server").default;

// Export the API as a Cloud Function v2
exports.api = onRequest({
  region: "us-central1",
  memory: "256MiB",  // Ajustar según necesidades
  minInstances: 0,   // Sin instancias mínimas para reducir costos
  maxInstances: 10   // Limitar instancias máximas
}, expressApp);

logger.info("Firebase Function v2 initialized for Atom Backend");

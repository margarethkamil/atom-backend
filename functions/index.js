/**
 * Cloud Functions for Firebase - Atom Backend
 * Using the recommended simple approach for Express with Firebase Functions
 */

// Import Firebase Functions
const functions = require("firebase-functions");
const logger = functions.logger;

// Set production environment
process.env.NODE_ENV = "production";

// Import Express app without invoking listen()
let expressApp;
try {
  logger.info("Importing Express app from ../dist/server");
  expressApp = require("../dist/server").default;
  logger.info("Successfully imported Express app");
} catch (error) {
  logger.error(`Failed to import Express app: ${error.message}`);
  throw new Error(`Cannot import Express app: ${error.message}`);
}

// Export the API as a standard Cloud Function (v1 style)
// This is the simplest and most reliable approach
exports.api = functions.https.onRequest(expressApp);

logger.info("Firebase Function initialized with Express integration");

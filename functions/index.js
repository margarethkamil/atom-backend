/**
 * Cloud Functions for Firebase - Atom Backend
 * V2 functions - Standalone Express Server approach
 */

// Simple logger for debugging
const logger = require("firebase-functions/logger");

// Set production environment for the app
process.env.NODE_ENV = "production";

// Log PORT environment variable
logger.info(`PORT environment variable is set to: ${process.env.PORT}`);

// Only require the server module - it will start listening on process.env.PORT
// This is the ONLY thing needed for Cloud Run to detect the server
require("../dist/server");

// Export a dummy function for Firebase to register this module
// The actual server is the Express app listening on PORT
exports.api = {
  // This object is just for Firebase to recognize the module
  // The real work is done by the Express server
};

logger.info("Firebase Function v2 initialized - Using standalone server approach");

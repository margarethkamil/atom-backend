/**
 * Cloud Functions for Firebase - Atom Backend
 * Express implementation using the TypeScript API from 'src'
 */

// Firebase Functions SDK
const functions = require("firebase-functions");

// Import the compiled Express app from the dist folder
let app;

try {
  // Intentar importar la aplicación Express compilada
  app = require("./dist/server").default;
  console.log("Successfully imported TypeScript API from ./dist/server");
} catch (error) {
  console.error("Error importing API from ./dist/server:", error.message);
  throw new Error("Failed to load API: " + error.message);
}

// Export the Express app as a Cloud Function with the name 'atom'
exports.atom = functions.https.onRequest(app);

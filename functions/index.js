/**
 * Cloud Functions for Firebase - Atom Backend
 * Express implementation using the TypeScript API from 'src'
 */

// Firebase Functions SDK
const functions = require("firebase-functions");
const express = require("express");

// Create a variable to hold our app
let app;

try {
  // Set environment variable to indicate we're in Firebase Functions
  process.env.FUNCTION_NAME = 'atom';
  process.env.NODE_ENV = 'production';
  
  // Try to import the compiled Express app from the dist folder
  const importedApp = require("./dist/server").default;
  
  if (importedApp && typeof importedApp === 'function') {
    app = importedApp;
    console.log("Successfully imported TypeScript API from ./dist/server");
  } else {
    throw new Error("Imported app is not a valid Express application");
  }
} catch (error) {
  console.error("Error importing API from ./dist/server:", error.message);
  
  // Create a basic fallback Express app
  app = express();
  
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'error',
      message: 'API import failed, using fallback',
      error: error.message
    });
  });
  
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'error', 
      message: 'Health check available but API failed to load'
    });
  });
}

// Export the Express app as a Cloud Function with the name 'atom'
exports.atom = functions.https.onRequest((req, res) => {
  // Ensure proper handling of the request
  return app(req, res);
});

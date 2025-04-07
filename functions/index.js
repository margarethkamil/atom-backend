/**
 * Cloud Functions for Firebase - Atom Backend
 * Express implementation using the TypeScript API from 'src'
 */

// Firebase Functions SDK
const functions = require("firebase-functions");
const express = require("express");
const fs = require('fs');
const path = require('path');

// Create a variable to hold our app
let app;

try {
  // Set environment variable to indicate we're in Firebase Functions
  process.env.FUNCTION_NAME = 'atom';
  process.env.NODE_ENV = 'production';
  
  // Debug: Check if dist/server.js exists - buscando en el subdirectorio local
  const serverJsPath = path.join(__dirname, 'dist', 'server.js');
  const exists = fs.existsSync(serverJsPath);
  console.log(`Checking if ${serverJsPath} exists: ${exists}`);
  
  if (exists) {
    // List contents of the dist directory
    const distContents = fs.readdirSync(path.join(__dirname, 'dist'));
    console.log('Contents of dist directory:', distContents);
    
    // Try to import the compiled Express app from the dist folder
    try {
      // Use dynamic require to get the module
      const serverModule = require('./dist/server');
      
      // Try different ways to get the Express app
      const importedApp = serverModule.default || serverModule;
      
      console.log('Server module type:', typeof serverModule);
      console.log('Server module keys:', Object.keys(serverModule));
      
      if (importedApp && typeof importedApp === 'function') {
        app = importedApp;
        console.log("Successfully imported TypeScript API from ./dist/server");
      } else {
        console.log("Imported module structure:", typeof importedApp, Object.keys(importedApp || {}));
        throw new Error("Imported app is not a valid Express application");
      }
    } catch (importError) {
      console.error("Import error details:", importError);
      throw importError;
    }
  } else {
    throw new Error(`Server.js not found at ${serverJsPath}`);
  }
} catch (error) {
  console.error("Error importing API from ./dist/server:", error.message, error.stack);
  
  // Create a basic fallback Express app
  app = express();
  
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'error',
      message: 'API import failed, using fallback',
      error: error.message,
      stack: error.stack
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

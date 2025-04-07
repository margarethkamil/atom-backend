/**
 * Cloud Functions for Firebase - Atom Backend
 * Express implementation using the TypeScript API from 'src'
 */

// Firebase Functions SDK
const functions = require("firebase-functions");
const express = require("express");

// Create a fallback Express app in case the import fails
let app;

try {
  // Try to import the compiled Express app from the dist folder
  // Buscar tanto en la ruta relativa directa como en la estructura de subcarpetas
  try {
    // Intentar ruta relativa directa
    app = require("./dist/server").default;
    console.log("Successfully imported TypeScript app from ./dist/server");
  } catch (innerError) {
    // Intentar ruta alternativa
    app = require("../dist/server").default;
    console.log("Successfully imported TypeScript app from ../dist/server");
  }
} catch (error) {
  console.error("Error importing app from dist/server:", error);
  
  // Fallback to a simple Express app
  app = express();
  
  // Set up basic routes
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Atom Backend API is running (fallback)",
      timestamp: new Date().toISOString()
    });
  });
  
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Server is healthy (fallback)",
      timestamp: new Date().toISOString()
    });
  });
}

// Export the Express app as a Cloud Function with the name 'atom'
exports.atom = functions.https.onRequest(app);

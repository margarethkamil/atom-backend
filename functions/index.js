/**
 * Cloud Functions for Firebase - Atom Backend
 * Simple Express implementation directly in index.js
 */

// Firebase Functions SDK
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

// Initialize Express app
const app = express();

// Set up middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for health checks
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Atom Backend API is running",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

// API root endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API root endpoint",
    endpoints: [
      "/api",
      "/api/users",
      "/health",
      "/"
    ]
  });
});

// Example API endpoint
app.get("/api/users", (req, res) => {
  res.status(200).json({
    status: "success",
    data: [
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
      { id: 3, name: "User 3" }
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: err.message
  });
});

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);

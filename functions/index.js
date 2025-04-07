/**
 * Cloud Functions for Firebase - Atom Backend
 * Express implementation with multiple API keys using Firebase Config
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

// API Key middleware using multiple keys from Firebase Config
app.use((req, res, next) => {
  // Public routes (no auth required)
  if (req.path === '/health') {
    return next();
  }
  
  try {
    // Step 1: Get the origin
    const origin = req.get('origin') || req.get('referer');
    
    // List of allowed origins that receive auto-injected API key
    const allowedOrigins = [
      'http://localhost:4200',  // Development
      'https://atom-frontend.web.app'  // Production
    ];
    
    // Check if request is coming from allowed origin
    const isAllowedOrigin = allowedOrigins.some(allowed => origin?.startsWith(allowed));
    
    // Get all valid API keys from Firebase Config
    const configApiKeys = [];
    
    // Default key for local development
    const defaultKey = process.env.DEFAULT_API_KEY || "MTEwMz-atom-v1";
    
    try {
      // Check if Firebase Config is available
      const apiConfig = functions.config().api || {};
      
      // Extract all keys from the config object
      Object.keys(apiConfig).forEach(keyName => {
        if (keyName.startsWith('key')) {
          configApiKeys.push(apiConfig[keyName]);
        }
      });
      
      console.log(`Found ${configApiKeys.length} API keys in config`);
    } catch (configError) {
      console.warn("Error reading config, using default key:", configError);
    }
    
    // If no keys in config or running locally, use default key
    if (configApiKeys.length === 0 && defaultKey) {
      configApiKeys.push(defaultKey);
    }
    
    // Step 2: Handle based on origin
    if (isAllowedOrigin) {
      // AUTO-INJECT API KEY for trusted origins (frontend)
      console.log('Trusted origin detected, auto-injecting API key');
      
      // Use the first valid key
      if (configApiKeys.length > 0) {
        req.headers['x-api-key'] = configApiKeys[0];
        return next();
      } else {
        return res.status(500).json({
          status: "error",
          message: "No API keys configured"
        });
      }
    } else {
      // MANUAL API KEY CHECK for non-trusted origins (Postman, tests)
      console.log('Non-trusted origin, checking for manual API key');
      
      // Get API key from request header or query param
      const apiKey = req.headers['x-api-key'] || req.query.api_key;
      
      if (!apiKey) {
        return res.status(403).json({
          status: "error",
          message: "Acceso denegado: API Key no proporcionada"
        });
      }
      
      // Check if provided API key matches any valid key
      const isValidKey = configApiKeys.includes(apiKey);
      
      if (!isValidKey) {
        return res.status(403).json({
          status: "error",
          message: "Acceso denegado: API Key inválida"
        });
      }
      
      // Valid API key provided, allow the request
      return next();
    }
  } catch (error) {
    console.error("Error verifying API key:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno al verificar API key"
    });
  }
});

// Root route for health checks
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Atom Backend API is running",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (public)
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
      { id: 3, name: "User 3" },
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: err.message,
  });
});

// Export the Express app as a Cloud Function with the name 'atom' instead of 'api'
exports.atom = functions.https.onRequest(app);

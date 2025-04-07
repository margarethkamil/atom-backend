import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { apiKeyMiddleware } from './middlewares/apikey.middleware';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// ==========================================
// MIDDLEWARES
// ==========================================

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply API key validation middleware
app.use(apiKeyMiddleware);

// ==========================================
// ROUTES
// ==========================================

// Register main API routes
app.use('/api', routes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running'
  });
});

// Root endpoint (CRITICAL for Cloud Run health checks)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success', 
    message: 'Atom Backend API is running'
  });
});

// Global error handler
app.use(errorMiddleware);

// Export the Express app - both for ESM and CommonJS compatibility
export default app;
module.exports = Object.assign(exports.default || {}, { default: app });

// ==========================================
// Start server (only if this file is executed directly)
// ==========================================

// This code will only run if server.ts (or compiled server.js) is the entry point
if (require.main === module) {
  // ALWAYS use the PORT environment variable for Cloud Run compatibility
  const port = parseInt(process.env.PORT || '8080');

  console.log(`Starting server with PORT=${port} and NODE_ENV=${process.env.NODE_ENV || 'development'}`);

  // Start the server
  const server = app.listen(port, () => {
    console.log(`⚡️ Server is running on port ${port}`);
    console.log(`📝 API is available at http://localhost:${port}/api`);
    console.log(`🔍 Health check is available at http://localhost:${port}/health`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
} 
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

// Load environment variables
dotenv.config();

/**
 * Initialize Express application
 */
const app = express();

/**
 * Configure global middlewares
 */
// CORS configuration for communication with frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

/**
 * Register API routes
 */
app.use('/api', routes);

/**
 * Basic health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running'
  });
});

// Add root endpoint for Cloud Run health checks (CRITICAL)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Atom Backend API is running'
  });
});

/**
 * Global error handler middleware
 */
app.use(errorMiddleware);

// ALWAYS start the server to listen on the appropriate port
// This is REQUIRED for Cloud Functions v2, as it needs 
// an HTTP server listening on PORT (8080 by default)
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`⚡️ Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🔍 Health check endpoint available at /`);
    console.log(`🔍 API endpoints available at /api`);
  } else {
    console.log(`📝 API endpoints available at http://localhost:${port}/api`);
  }
});

// Handle graceful shutdown (important for Cloud Run)
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

// Export the app for testing purposes
export default app; 
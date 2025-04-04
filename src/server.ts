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

// Add root endpoint for Cloud Run health checks
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

// Always start the server to listen on the appropriate port
// This is REQUIRED for Cloud Functions v2, which needs the app to be listening on PORT
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`⚡️ Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📝 API endpoints available at http://localhost:${port}/api`);
});

// Export the app for testing purposes
export default app; 
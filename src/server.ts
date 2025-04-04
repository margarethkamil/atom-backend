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
 * TESTING ROUTE
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running'
  });
});

/**
 * Global error handler middleware
 */
app.use(errorMiddleware);

// Only start the server when running directly (not when imported as a module by Firebase Functions)
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`⚡️ Server is running at http://localhost:${port}`);
    console.log(`📝 API endpoints available at http://localhost:${port}/api`);
  });
}

export default app; 
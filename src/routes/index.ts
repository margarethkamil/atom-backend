import { Router } from 'express';
import authRouter from './auth.routes';
import taskRoutes from './task.routes';
import { apiKeyMiddleware } from '../middlewares/apikey.middleware';

/**
 * Main router that integrates all route modules
 */
const router = Router();

// Routes that don't require API key validation
router.use('/auth', authRouter);

// Task routes with API key validation
router.use('/tasks', taskRoutes);

// Apply API key validation to routes (already done at app level in server.ts)
// Uncomment and create user routes when needed
// import userRouter from './user.routes';
// router.use('/users', apiKeyMiddleware, userRouter);

export default router; 
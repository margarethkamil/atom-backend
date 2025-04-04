import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';

/**
 * Main router that combines all route modules
 */
const router = Router();

/**
 * Register all route modules with their respective prefixes
 */
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

export default router; 
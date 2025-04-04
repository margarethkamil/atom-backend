import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody, validators } from '../middlewares/validation.middleware';
import { LoginUserDto, CreateUserDto } from '../models/user.model';

// Create router instance
const router = Router();
const authController = new AuthController();

/**
 * Authentication routes
 * Prefix: /auth
 */

/**
 * @route   POST /auth/login
 * @desc    Login a user or redirect for registration
 * @access  Public
 */
router.post(
  '/login',
  validateBody<LoginUserDto>({
    email: validators.email
  }),
  authController.login
);

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validateBody<CreateUserDto>({
    email: validators.email
  }),
  authController.register
);

export default router; 
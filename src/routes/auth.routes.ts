import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody, validators } from '../middlewares/validation.middleware';
import { LoginUserDto, CreateUserDto, GoogleAuthDto } from '../models/user.model';

/**
 * Router for authentication related endpoints
 */
export const authRouter = Router();
const authController = new AuthController();

/**
 * Authentication routes
 * Prefix: /auth
 */

/**
 * @route   POST /auth/login
 * @desc    Login a user
 * @access  Public
 */
authRouter.post(
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
authRouter.post(
  '/register',
  validateBody<CreateUserDto>({
    email: validators.email
  }),
  authController.register
);

/**
 * @route   POST /auth/google
 * @desc    Authenticate with Google (client-side flow)
 * @access  Public
 */
authRouter.post(
  '/google',
  validateBody<GoogleAuthDto>({
    idToken: validators.required('ID Token')
  }),
  authController.googleAuth
);

// Routes for server-side OAuth flow with Google
authRouter.get('/google/init', authController.initiateGoogleAuth);
authRouter.get('/google/callback', authController.handleGoogleCallback);

export default authRouter; 
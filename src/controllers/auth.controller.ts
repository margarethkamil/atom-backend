import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { LoginUserDto, CreateUserDto } from '../models/user.model';
import { ApiError } from '../middlewares/error.middleware';

/**
 * Controller handling authentication-related requests
 */
export class AuthController {
  private userService: UserService;

  /**
   * Initialize the controller with dependencies
   */
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Login a user with email
   * If user doesn't exist, returns a message indicating this
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body as LoginUserDto;
      
      // Validate email
      if (!email) {
        next(new ApiError(400, 'Email is required'));
        return;
      }

      // Find user by email
      const user = await this.userService.findUserByEmail(email);
      
      if (!user) {
        // User not found, return indication
        res.status(404).json({
          status: 'not_found',
          message: 'User not found',
          userExists: false
        });
        return;
      }

      // Generate token for the authenticated user
      const { token } = await this.userService.loginUser(email);
      
      // Return user data and token
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        userExists: true,
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Register a new user
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body as CreateUserDto;
      
      // Validate email
      if (!email) {
        next(new ApiError(400, 'Email is required'));
        return;
      }

      // Check if user already exists
      const existingUser = await this.userService.findUserByEmail(email);
      
      if (existingUser) {
        next(new ApiError(409, 'User with this email already exists'));
        return;
      }

      // Create the user
      const newUser = await this.userService.createUser({ email });
      
      // Generate token for the new user
      const { token } = await this.userService.loginUser(email);

      // Return success response with user data and token
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: newUser,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };
} 
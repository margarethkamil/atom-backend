import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { LoginUserDto, CreateUserDto, GoogleAuthDto } from '../models/user.model';
import { ApiError } from '../middlewares/error.middleware';
import { generateToken } from '../utils/token.utils';
import { getGoogleAuthUrl, generateStateToken, oAuth2Client } from '../config/google-auth-config';
import * as crypto from 'crypto';

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
   * First tries to synchronize between Firebase Auth and Firestore
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, displayName } = req.body as LoginUserDto;
      
      // Validate email
      if (!email) {
        next(new ApiError(400, 'Email is required'));
        return;
      }

      try {
        // Attempt to find and login the user, passing displayName if available
        const { user, token } = await this.userService.loginUser(email, displayName);
        
        // Return user data and token
        res.status(200).json({
          status: 'success',
          message: 'Login successful',
          data: {
            user,
            token
          }
        });
      } catch (error) {
        // Check if the error is because user not found
        if (error instanceof Error && error.message === 'User not found') {
          next(new ApiError(404, 'User not found. Please register first.'));
          return;
        }
        // For other errors, pass to the error handler
        throw error;
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Register a new user with Firebase Authentication
   * This method creates a user in both Firebase Auth and Firestore
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, displayName, photoURL } = req.body as CreateUserDto;
      
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

      // Create the user with Firebase Authentication
      const newUser = await this.userService.createUserWithFirebaseAuth({ 
        email, 
        displayName: displayName || email.split('@')[0], // Generate a displayName if not provided
        photoURL,
        authType: 'email'
      });
      
      // Generate token for the new user
      const token = await generateToken(newUser.id as string);

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
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message === 'Email already in use') {
          next(new ApiError(409, 'User with this email already exists'));
          return;
        }
      }
      
      next(error);
    }
  };

  /**
   * Authenticate a user with Google
   * If the user doesn't exist, creates a new one with Google profile information
   */
  googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { idToken } = req.body as GoogleAuthDto;
      
      // Validate idToken
      if (!idToken) {
        next(new ApiError(400, 'Google ID token is required'));
        return;
      }

      // Process Google authentication
      const { user, token } = await this.userService.handleGoogleAuth(idToken);
      
      // Return success response with user data and token
      res.status(200).json({
        status: 'success',
        message: 'Google authentication successful',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('Google auth error:', error);
      
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message.includes('Token is not from a Google auth provider')) {
          next(new ApiError(400, 'Invalid Google token format'));
          return;
        } else if (error.message.includes('Email not found')) {
          next(new ApiError(400, 'Email not provided in Google account'));
          return;
        }
      }
      
      next(error);
    }
  };

  /**
   * Initiate Google authentication by redirecting to Google's login page
   * This starts the server-side OAuth flow
   */
  initiateGoogleAuth = (req: Request, res: Response): void => {
    try {
      // Generate a state token to prevent CSRF attacks
      const stateToken = generateStateToken();
      
      // In a production app, you would store this in a session or temporary storage
      // For this example, we'll include frontend URL in the state parameter (encoded)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      const stateData = JSON.stringify({ 
        token: stateToken,
        redirectUrl: frontendUrl
      });
      const state = Buffer.from(stateData).toString('base64');
      
      // Get the authentication URL from Google
      const authUrl = getGoogleAuthUrl(state);
      
      // Redirect the user to Google's authentication page
      res.redirect(authUrl);
    } catch (error) {
      console.error('Error initiating Google auth:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to initiate Google authentication'
      });
    }
  };

  /**
   * Handle callback from Google OAuth
   * This completes the server-side OAuth flow
   */
  handleGoogleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get the authorization code and state from the query parameters
      const { code, state } = req.query;
      
      if (!code) {
        next(new ApiError(400, 'Authorization code not provided'));
        return;
      }
      
      // Decode the state parameter to get original data
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      
      if (state) {
        try {
          const decodedState = Buffer.from(state as string, 'base64').toString();
          const stateData = JSON.parse(decodedState);
          if (stateData.redirectUrl) {
            frontendUrl = stateData.redirectUrl;
          }
        } catch (e) {
          console.error('Error parsing state:', e);
        }
      }
      
      try {
        // Exchange the authorization code for tokens
        const { tokens } = await oAuth2Client.getToken(code as string);
        oAuth2Client.setCredentials(tokens);
        
        // Get the ID token
        const idToken = tokens.id_token;
        
        if (!idToken) {
          next(new ApiError(400, 'ID token not provided by Google'));
          return;
        }
        
        // Process the Google authentication
        const { user, token } = await this.userService.handleGoogleAuth(idToken);
        
        // Create HTML response that will communicate with the frontend
        const successHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Authentication Successful</title>
              <script>
                window.onload = function() {
                  // Send the auth data to the opener (frontend app)
                  if (window.opener) {
                    window.opener.postMessage({
                      type: 'GOOGLE_AUTH_SUCCESS',
                      data: {
                        token: "${token}",
                        user: ${JSON.stringify(user)}
                      }
                    }, "${frontendUrl}");
                    
                    // Close the popup after a short delay
                    setTimeout(function() {
                      window.close();
                    }, 1000);
                  } else {
                    // If opened in the same window, redirect back to the app
                    window.location.href = "${frontendUrl}/login/success?token=${token}";
                  }
                };
              </script>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  text-align: center;
                }
                .container {
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                h1 {
                  color: #4285F4;
                }
                p {
                  margin-top: 20px;
                  color: #555;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Authentication Successful!</h1>
                <p>You can close this window and return to the application.</p>
              </div>
            </body>
          </html>
        `;
        
        // Send the HTML page
        res.setHeader('Content-Type', 'text/html');
        res.send(successHtml);
      } catch (error) {
        // If token exchange fails, redirect to frontend with error
        res.redirect(`${frontendUrl}/login?error=authentication_failed`);
      }
    } catch (error) {
      console.error('Error handling Google callback:', error);
      next(error);
    }
  };
} 
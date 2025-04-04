import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token.utils';

/**
 * Interface extending Express Request to include userId
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Authentication middleware that validates JWT tokens
 * This protects routes that require authentication
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ message: 'Authorization header is missing' });
      return;
    }

    // Format should be "Bearer [token]"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ message: 'Invalid authorization format' });
      return;
    }

    const token = parts[1];

    // Verify the token
    try {
      const userId = await verifyToken(token);
      
      // Attach the userId to the request object for use in route handlers
      req.userId = userId;
      
      // Continue to the route handler
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
}; 
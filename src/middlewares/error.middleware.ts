import { Request, Response, NextFunction } from 'express';

/**
 * Interface for API errors with status code
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number, 
    public message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Error handling middleware for catching and formatting API errors
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);
  
  // Handle known API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
    return;
  }
  
  // Handle unknown errors
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}; 
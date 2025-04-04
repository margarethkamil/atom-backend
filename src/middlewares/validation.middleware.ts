import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error.middleware';

/**
 * Type for validation schema functions
 */
type ValidationSchema<T> = {
  [K in keyof T]?: (value: any) => boolean | string;
};

/**
 * Creates a validation middleware for request body
 * @param schema - Validation schema with field names and validation functions
 * @returns Express middleware function
 */
export const validateBody = <T>(schema: ValidationSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    
    // Check each field against validation rules
    for (const [field, validator] of Object.entries(schema)) {
      const value = req.body[field];
      
      if (validator) {
        // If validator returns a string, it's an error message
        const result = (validator as (value: any) => boolean | string)(value);
        
        if (typeof result === 'string') {
          errors.push(result);
        } else if (result === false) {
          errors.push(`Invalid value for field: ${field}`);
        }
      }
    }
    
    // If there are validation errors, return a 400 response
    if (errors.length > 0) {
      next(new ApiError(400, errors.join(', ')));
      return;
    }
    
    // If validation passes, continue to the next middleware/route handler
    next();
  };
};

/**
 * Common validation functions
 */
export const validators = {
  /**
   * Validates that a value is not empty
   */
  required: (fieldName: string) => (value: any): boolean | string => {
    if (value === undefined || value === null || value === '') {
      return `${fieldName} is required`;
    }
    return true;
  },
  
  /**
   * Validates that a value is a valid email
   */
  email: (value: string): boolean | string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Invalid email address';
    }
    return true;
  },
  
  /**
   * Validates minimum string length
   */
  minLength: (min: number, fieldName: string) => (value: string): boolean | string => {
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return true;
  }
}; 
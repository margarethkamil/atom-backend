import { Request, Response, NextFunction } from 'express';
import * as functions from 'firebase-functions';
import { ApiError } from './error.middleware';

/**
 * Middleware that handles API key validation with two modes:
 * 1. Auto-injects API key for authorized origins (frontend)
 * 2. Requires manual API key for unauthorized origins (Postman, tests)
 */
export const apiKeyMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  // Public routes (bypass check)
  if (req.path === '/health') {
    return next();
  }
  
  try {
    // Step 1: Get the origin
    const origin = req.get('origin') || req.get('referer');
    
    // List of allowed origins that receive auto-injected API key
    const allowedOrigins = [
      'http://localhost:4200',  // Development
      // 'https://site.com'  // Production (uncomment when ready)
    ];
    
    // Check if request is coming from allowed origin
    const isAllowedOrigin = allowedOrigins.some(allowed => origin?.startsWith(allowed));
    
    // Get valid API keys from Firebase Config
    const configApiKeys: string[] = [];
    
    // Default key for local development
    const defaultKey = process.env.DEFAULT_API_KEY || "";
    
    try {
      // Check if Firebase configuration exists
      const apiConfig = functions.config().api || {};
      
      // Extract all keys from the configuration
      Object.keys(apiConfig).forEach(keyName => {
        if (keyName.startsWith('key')) {
          configApiKeys.push(apiConfig[keyName]);
        }
      });
      
    } catch (configError) {
      console.warn("Error reading config, using default key:", configError);
    }
    
    // If no keys in config or we're in local environment, use default key
    if (configApiKeys.length === 0 && defaultKey) {
      configApiKeys.push(defaultKey);
    }
    
    // Step 2: Handle based on origin
    if (isAllowedOrigin) {
      // AUTO-INJECT API KEY for trusted origins (frontend)
      console.log('Trusted origin detected, auto-injecting API key');
      
      // Use the first valid key
      if (configApiKeys.length > 0) {
        req.headers['x-api-key'] = configApiKeys[0];
        return next();
      } else {
        return next(new ApiError(500, 'No API keys configured'));
      }
    } else {
      // MANUAL API KEY CHECK for non-trusted origins (Postman, tests)
      console.log('Non-trusted origin, checking for manual API key');
      
      // Get API key from header
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        return next(new ApiError(403, 'API Key no proporcionada'));
      }
      
      // Verify if provided API key is valid
      const isValidKey = configApiKeys.includes(apiKey);
      
      if (!isValidKey) {
        return next(new ApiError(403, 'API Key inválida'));
      }
      
      // Valid API key provided, allow the request
      return next();
    }
  } catch (error) {
    console.error("Error verificando seguridad:", error);
    next(new ApiError(500, 'Error interno de seguridad'));
  }
};
import { Request, Response, NextFunction } from 'express';
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
    console.log('Request origin:', origin);
    
    // List of allowed origins that receive auto-injected API key
    const allowedOrigins = [
      'http://localhost:4200',  // Development
      'https://atom-frontend.web.app'  // Production - Eliminado el slash final
    ];
    
    // Check if request is coming from allowed origin
    const isAllowedOrigin = allowedOrigins.some(allowed => origin?.startsWith(allowed));
    console.log('Is allowed origin:', isAllowedOrigin);
    
    // Get valid API keys from environment variables (Cloud Functions v2 approach)
    const configApiKeys: string[] = [];
    
    // Default key for production environment
    const defaultKey = process.env.DEFAULT_API_KEY || "";
    
    // Read API keys from environment variables
    const envKey1 = process.env.API_KEY_1 || "";
    const envKey2 = process.env.API_KEY_2 || "";
    
    // Add valid keys to the list
    if (defaultKey) configApiKeys.push(defaultKey);
    if (envKey1) configApiKeys.push(envKey1);
    if (envKey2) configApiKeys.push(envKey2);
    
    console.log('Environment variables present:',
      {
        DEFAULT_API_KEY: !!process.env.DEFAULT_API_KEY,
        API_KEY_1: !!process.env.API_KEY_1,
        API_KEY_2: !!process.env.API_KEY_2,
        NODE_ENV: process.env.NODE_ENV
      }
    );
    
    // Log the number of available API keys
    console.log(`Available API keys: ${configApiKeys.length}`);
    
    // Step 2: Handle based on origin
    if (isAllowedOrigin) {
      // AUTO-INJECT API KEY for trusted origins (frontend)
      console.log('Trusted origin detected, auto-injecting API key');
      
      // Use the first valid key
      if (configApiKeys.length > 0) {
        req.headers['x-api-key'] = configApiKeys[0];
        return next();
      } else {
        return next(new ApiError(500, 'No API keys configured - please set DEFAULT_API_KEY environment variable'));
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
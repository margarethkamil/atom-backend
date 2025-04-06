import * as jwt from 'jsonwebtoken';
import { verifyGoogleIdToken } from '../config/google-auth-config';

// JWT token expiration (7 days)
const TOKEN_EXPIRATION = '7d';

/**
 * Interface for the decoded Google token payload
 */
export interface GoogleTokenPayload {
  sub: string;         // Subject - Unique Google ID
  email: string;       // User's email
  email_verified: boolean; // Whether email is verified
  name?: string;       // User's full name
  picture?: string;    // URL to user's profile picture
  given_name?: string; // User's first name
  family_name?: string; // User's last name
  locale?: string;     // User's locale (e.g., 'en')
  iat?: number;        // Issued at timestamp
  exp?: number;        // Expiration timestamp
  firebase?: {         // Firebase specific data
    sign_in_provider?: string;
    identities?: {
      [key: string]: string[];
    };
  };
}

/**
 * Generates a JWT token for a user
 * @param userId User ID to include in the token
 * @returns Promise resolving to the generated token
 */
export const generateToken = async (userId: string): Promise<string> => {
  const secretKey = process.env.JWT_SECRET_KEY || 'atom-api-default-secret-key';
  
  return new Promise((resolve, reject) => {
    jwt.sign(
      { userId },
      secretKey,
      { expiresIn: TOKEN_EXPIRATION },
      (err, token) => {
        if (err) {
          console.error('Error generating token:', err);
          reject(new Error('Failed to generate authentication token'));
        } else {
          resolve(token as string);
        }
      }
    );
  });
};

/**
 * Verifies a JWT token and returns the user ID
 * @param token JWT token to verify
 * @returns Promise resolving to the user ID
 */
export const verifyToken = async (token: string): Promise<string> => {
  const secretKey = process.env.JWT_SECRET_KEY || 'atom-api-default-secret-key';
  
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err);
        reject(new Error('Invalid or expired token'));
      } else {
        // The decoded token should contain the userId
        const payload = decoded as { userId: string };
        
        if (!payload.userId) {
          reject(new Error('Invalid token structure'));
        } else {
          resolve(payload.userId);
        }
      }
    });
  });
};

/**
 * Verifies a Google or Firebase ID token and extracts user information
 * @param idToken Google ID token or Firebase Auth token to verify
 * @returns Promise resolving to the verified token data
 */
export const verifyGoogleToken = async (idToken: string): Promise<GoogleTokenPayload> => {
  try {
    // Get payload from Google/Firebase token
    const payload = await verifyGoogleIdToken(idToken);
    
    // Check required fields
    if (!payload.sub || !payload.email) {
      throw new Error('Invalid token: missing required fields');
    }
    
    // Firebase tokens will already have the structure we need
    // Just return the payload if it has the correct structure
    if (payload.firebase) {
      return payload as GoogleTokenPayload;
    }
    
    // For standard Google tokens, create standardized payload
    const tokenData: GoogleTokenPayload = {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified || false,
      name: payload.name,
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name,
      locale: payload.locale,
      iat: payload.iat,
      exp: payload.exp
    };
    
    return tokenData;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error(`Failed to verify token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 
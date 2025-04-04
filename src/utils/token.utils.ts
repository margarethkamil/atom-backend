import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// JWT expiration time (in seconds)
const TOKEN_EXPIRATION = 60 * 60 * 24 * 7; // 7 days

/**
 * Generates a JWT token for a user
 * @param userId - The user ID to encode in the token
 * @returns A Promise that resolves to the generated JWT token
 */
export const generateToken = async (userId: string): Promise<string> => {
  try {
    const token = await admin.auth().createCustomToken(userId, {
      expiresIn: TOKEN_EXPIRATION,
    });
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verifies a JWT token and returns the user ID
 * @param token - The JWT token to verify
 * @returns A Promise that resolves to the user ID from the token
 */
export const verifyToken = async (token: string): Promise<string> => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid or expired token');
  }
}; 
import { OAuth2Client } from 'google-auth-library';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import admin from './firebase-config';

// Load environment variables
dotenv.config();

/**
 * Firebase configuration (provided as environment variables or defaults)
 */
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAcqP88-U_Pr_hO2xdvsSQYPRe5P5MHD2k",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "atom-backend-396e7.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "atom-backend-396e7",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "atom-backend-396e7.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "304242936756",
  appId: process.env.FIREBASE_APP_ID || "1:304242936756:web:db9c1eb73a3e0c8c3a2a59"
};

/**
 * Google OAuth configuration
 */
export const googleOauthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || "304242936756-hk71g1lqeq1fh0r54bfn6fbmi0v0luvr.apps.googleusercontent.com",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  redirectUri: process.env.GOOGLE_REDIRECT_URI || "https://us-central1-atom-backend-396e7.cloudfunctions.net/atom/api/auth/google/callback",
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]
};

/**
 * Create OAuth2 client for Google authentication
 */
export const oAuth2Client = new OAuth2Client(
  googleOauthConfig.clientId,
  googleOauthConfig.clientSecret,
  googleOauthConfig.redirectUri
);

/**
 * Generates a URL for Google authentication
 * @param state CSRF protection token
 * @returns URL to redirect the user to Google's authentication page
 */
export const getGoogleAuthUrl = (state: string): string => {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: googleOauthConfig.scopes,
    state
  });
};

/**
 * Generates a secure random token for CSRF protection
 * @returns Random token string
 */
export const generateStateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Verifies a Google ID token and returns the decoded payload
 * This function can handle both standard Google OAuth tokens and Firebase Auth tokens
 * @param idToken Google ID token or Firebase Auth token to verify
 * @returns Verified token payload
 */
export const verifyGoogleIdToken = async (idToken: string): Promise<any> => {
  try {
    // First try to verify as Firebase Auth token
    try {
      // Using Firebase Admin SDK to verify the token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Extract and format the user information
      return {
        sub: decodedToken.uid || decodedToken.sub,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified || false,
        name: decodedToken.name,
        picture: decodedToken.picture,
        given_name: decodedToken.given_name,
        family_name: decodedToken.family_name,
        firebase: {
          sign_in_provider: decodedToken.firebase?.sign_in_provider || 'google.com',
          identities: decodedToken.firebase?.identities
        }
      };
    } catch (firebaseError) {
      console.log('Not a Firebase token, trying Google OAuth verification...');
      
      // If Firebase verification fails, try standard Google OAuth verification
      const ticket = await oAuth2Client.verifyIdToken({
        idToken,
        audience: googleOauthConfig.clientId
      });
      
      return ticket.getPayload();
    }
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
}; 
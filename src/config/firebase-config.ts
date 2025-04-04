import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

/**
 * Initializes Firebase Admin SDK with service account credentials
 * This setup allows the application to interact with Firebase services
 */
const initializeFirebase = (): admin.app.App => {
  // Check if Firebase is already initialized to prevent multiple initializations
  if (!admin.apps.length) {
    try {
      // Best practice: Use applicationDefault which reads from GOOGLE_APPLICATION_CREDENTIALS
      // This is the recommended approach by Firebase
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw new Error('Failed to initialize Firebase');
    }
  }

  return admin.app();
};

// Initialize Firebase
const firebaseApp = initializeFirebase();

// Export Firestore database instance
export const db = firebaseApp.firestore();

// Export other Firebase services as needed
export const auth = firebaseApp.auth();

// Export Firebase admin for utility functions
export default admin; 
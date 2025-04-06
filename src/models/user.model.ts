/**
 * Interface representing a User entity
 * Contains basic user information required for authentication and identification
 */
export interface User {
  id?: string;        // Optional as it will be assigned by Firestore
  email: string;      // Primary identifier for the user
  createdAt: any;     // Timestamp of user creation (Firebase Timestamp)
  updatedAt?: any;    // Timestamp of last update (Firebase Timestamp) 
  lastLogin?: any;    // Timestamp of last login (Firebase Timestamp)
  displayName?: string; // User's display name (optional)
  photoURL?: string | null;  // URL to user's profile photo (optional)
  authType?: string;  // Authentication type ('email' or 'google')
  googleId?: string | null;  // Google user ID (only for Google auth)
  isActive?: boolean; // Whether the user account is active
}

/**
 * Interface for user creation request data
 */
export interface CreateUserDto {
  email: string;
  displayName?: string;
  photoURL?: string;
  authType?: string;
  googleId?: string | null;
}

/**
 * Interface for user login request data
 */
export interface LoginUserDto {
  email: string;
  displayName?: string; // Optional display name that can be provided during login
}

/**
 * Interface for Google authentication request data
 */
export interface GoogleAuthDto {
  idToken: string;    // Google ID token to verify
} 
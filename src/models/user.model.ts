/**
 * Interface representing a User entity
 * Contains basic user information required for authentication and identification
 */
export interface User {
  id?: string;        // Optional as it will be assigned by Firestore
  email: string;      // Primary identifier for the user
  createdAt: Date;    // Timestamp of user creation
}

/**
 * Interface for user creation request data
 */
export interface CreateUserDto {
  email: string;
}

/**
 * Interface for user login request data
 */
export interface LoginUserDto {
  email: string;
} 
import { db } from '../config/firebase-config';
import { User, CreateUserDto } from '../models/user.model';
import { generateToken } from '../utils/token.utils';

/**
 * Service responsible for user-related operations
 * Implements repository pattern for user data access
 */
export class UserService {
  private readonly userCollection = 'users';

  /**
   * Find a user by email
   * @param email - The email of the user to find
   * @returns A Promise that resolves to the found user or null if not found
   */
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const userSnapshot = await db
        .collection(this.userCollection)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        return null;
      }

      const userData = userSnapshot.docs[0];
      return {
        id: userData.id,
        email: userData.data().email,
        createdAt: userData.data().createdAt.toDate()
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Create a new user
   * @param userData - The user data for creation
   * @returns A Promise that resolves to the created user with ID
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const newUser: User = {
        email: userData.email,
        createdAt: new Date()
      };

      const docRef = await db.collection(this.userCollection).add(newUser);
      
      return {
        id: docRef.id,
        ...newUser
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Login a user and generate a token
   * @param email - The email of the user to login
   * @returns A Promise that resolves to the user data and auth token
   */
  async loginUser(email: string): Promise<{ user: User; token: string }> {
    try {
      // Find the user
      let user = await this.findUserByEmail(email);
      
      // If user doesn't exist, create a new one
      if (!user) {
        user = await this.createUser({ email });
      }

      // Generate token for the user
      const token = await generateToken(user.id as string);
      
      return { user, token };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw new Error('Failed to login user');
    }
  }
} 
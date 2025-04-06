import { db } from '../config/firebase-config';
import { User, CreateUserDto } from '../models/user.model';
import { generateToken, verifyGoogleToken, GoogleTokenPayload } from '../utils/token.utils';
import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';
import { auth } from '../config/firebase-config';
import { ApiError } from '../middlewares/error.middleware';

/**
 * Service responsible for user-related operations
 * Implements repository pattern for user data access
 */
export class UserService {
  private readonly userCollection = 'users';
  private usersCollection: firestore.CollectionReference;

  /**
   * Initialize the service with the users collection
   */
  constructor() {
    this.usersCollection = db.collection('users');
  }

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
        createdAt: userData.data().createdAt,
        displayName: userData.data().displayName,
        photoURL: userData.data().photoURL,
        authType: userData.data().authType,
        googleId: userData.data().googleId,
        updatedAt: userData.data().updatedAt,
        lastLogin: userData.data().lastLogin,
        isActive: userData.data().isActive
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find a user by Google ID
   * @param googleId - The Google ID of the user to find
   * @returns A Promise that resolves to the found user or null if not found
   */
  async findUserByGoogleId(googleId: string): Promise<User | null> {
    try {
      const userSnapshot = await db
        .collection(this.userCollection)
        .where('googleId', '==', googleId)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        return null;
      }

      const userData = userSnapshot.docs[0];
      return {
        id: userData.id,
        email: userData.data().email,
        createdAt: userData.data().createdAt,
        displayName: userData.data().displayName,
        photoURL: userData.data().photoURL,
        authType: userData.data().authType,
        googleId: userData.data().googleId,
        updatedAt: userData.data().updatedAt,
        lastLogin: userData.data().lastLogin,
        isActive: userData.data().isActive
      };
    } catch (error) {
      console.error('Error finding user by Google ID:', error);
      throw new Error('Failed to find user by Google ID');
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
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
        lastLogin: firestore.Timestamp.now(),
        displayName: userData.displayName || userData.email.split('@')[0],
        photoURL: userData.photoURL || null,
        authType: userData.authType || 'email',
        googleId: userData.googleId || null,
        isActive: true
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
   * Get a user from Firebase Auth by email
   * @param email - The email of the user to find in Firebase Auth
   * @returns A Promise that resolves to the user record if found, null otherwise
   */
  private async getUserFromFirebaseAuth(email: string): Promise<admin.auth.UserRecord | null> {
    try {
      const userRecord = await auth.getUserByEmail(email);
      return userRecord;
    } catch (error: any) {
      // If user doesn't exist in Firebase Auth
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Synchronize user between Firebase Auth and Firestore
   * This is a generic method that handles both Google and Email authentication
   * 
   * @param email User's email
   * @param authType Type of authentication ('email' or 'google')
   * @param userData Additional user data (displayName, photoURL, etc.)
   * @param googleData Google profile data (for Google auth only)
   * @returns Synchronized user object
   */
  async syncUserBetweenSystems(
    email: string,
    authType: string = 'email',
    userData: Partial<CreateUserDto> = {},
    googleData?: GoogleTokenPayload
  ): Promise<User> {
    console.log(`Synchronizing user between systems. Email: ${email}, Auth type: ${authType}`);
    
    // Step 1: Check if user exists in Firestore
    const firestoreUser = await this.findUserByEmail(email);
    if (firestoreUser) {
      console.log(`User found in Firestore: ${firestoreUser.id}`);
      return firestoreUser;
    }
    
    // Step 2: User not in Firestore, check Firebase Auth
    const firebaseUser = await this.getUserFromFirebaseAuth(email);
    
    // Step 3: If user exists in Firebase Auth but not in Firestore
    if (firebaseUser) {
      console.log(`User exists in Firebase Auth but not in Firestore: ${firebaseUser.uid}`);
      
      // Create Firestore document with Firebase Auth UID
      const newUser: User = {
        id: firebaseUser.uid,
        email: email,
        displayName: googleData?.name || userData.displayName || firebaseUser.displayName || email.split('@')[0],
        photoURL: googleData?.picture || userData.photoURL || firebaseUser.photoURL || null,
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
        lastLogin: firestore.Timestamp.now(),
        authType: authType,
        isActive: true,
        googleId: authType === 'google' ? googleData?.sub || null : null
      };
      
      // Save to Firestore using the Firebase Auth UID
      await this.usersCollection.doc(firebaseUser.uid).set(newUser);
      console.log(`Created Firestore record for existing Firebase Auth user: ${firebaseUser.uid}`);
      
      return newUser;
    }
    
    // Step 4: User doesn't exist in either system, create new user
    console.log(`User doesn't exist in either system, creating new user: ${email}`);
    
    // Prepare user data
    const createUserData: CreateUserDto = {
      email,
      displayName: googleData?.name || userData.displayName,
      photoURL: googleData?.picture || userData.photoURL,
      authType: authType,
      googleId: authType === 'google' ? googleData?.sub || null : null
    };
    
    // Create the user with Firebase Authentication
    return await this.createUserWithFirebaseAuth(createUserData);
  }

  /**
   * Handle Google authentication
   * Verifies the token and creates/updates the user as needed
   */
  async handleGoogleAuth(idToken: string): Promise<{ user: User; token: string }> {
    console.log('Starting Google authentication process...');
    
    try {
      // Verify the Google ID token
      const payload = await verifyGoogleToken(idToken);
      
      // Validate required fields in token
      if (!payload.email) {
        console.error('Token missing required email field');
        throw new Error('Email not found in Google token');
      }
      
      console.log(`Processing Google auth for email: ${payload.email}`);
      
      // Synchronize user between systems
      const user = await this.syncUserBetweenSystems(
        payload.email,
        'google',
        {}, // No additional user data
        payload // Pass Google profile data
      );
      
      // Update login time and any changed profile info
      const updatedUser = await this.updateUser(user.id as string, {
        lastLogin: firestore.Timestamp.now(),
        // Update profile photo if changed
        photoURL: payload.picture || user.photoURL
      });
      
      // Generate a JWT token for our system
      const token = await generateToken(user.id as string);
      
      console.log(`Google authentication completed successfully for: ${payload.email}`);
      
      return { user: updatedUser, token };
    } catch (error) {
      console.error('Google authentication failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to authenticate with Google');
    }
  }

  /**
   * Find a user by id
   */
  async findUserById(id: string): Promise<User | null> {
    const doc = await this.usersCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data() as User
    };
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    const snapshot = await this.usersCollection.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as User
    }));
  }

  /**
   * Update a user's profile
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    // Don't allow updating these fields directly
    delete userData.id;
    delete userData.email;
    delete userData.createdAt;
    
    // Add updated timestamp
    userData.updatedAt = firestore.Timestamp.now();
    
    // Update in Firestore
    await this.usersCollection.doc(id).update(userData);
    
    // Get updated user
    const updatedUser = await this.findUserById(id);
    
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    
    return updatedUser;
  }

  /**
   * Create a new user with Firebase Authentication
   * This method creates both a Firebase Auth user and a Firestore document
   * 
   * @param userData - The user data for creation
   * @returns A Promise that resolves to the created user with ID
   */
  async createUserWithFirebaseAuth(userData: CreateUserDto): Promise<User> {
    try {
      // First check if user exists in Firebase Auth
      const existingAuthUser = await this.getUserFromFirebaseAuth(userData.email);
      
      if (existingAuthUser) {
        console.log(`User ${userData.email} already exists in Firebase Auth. Creating Firestore record only.`);
        
        // User already exists in Firebase Auth, create only in Firestore
        const newUser: User = {
          id: existingAuthUser.uid,
          email: userData.email,
          displayName: userData.displayName || existingAuthUser.displayName || userData.email.split('@')[0],
          photoURL: userData.photoURL || existingAuthUser.photoURL || null,
          createdAt: firestore.Timestamp.now(),
          updatedAt: firestore.Timestamp.now(),
          lastLogin: firestore.Timestamp.now(),
          authType: userData.authType || 'email',
          isActive: true,
          googleId: userData.googleId || null
        };
        
        // Save to Firestore using the Firebase Auth UID
        await this.usersCollection.doc(existingAuthUser.uid).set(newUser);
        
        return newUser;
      }
      
      // User doesn't exist in Firebase Auth, create in both systems
      console.log(`Creating new user in both Firebase Auth and Firestore: ${userData.email}`);
      
      // Create user record in Firebase Auth
      const userRecord = await auth.createUser({
        email: userData.email,
        displayName: userData.displayName || userData.email?.split('@')[0],
        photoURL: userData.photoURL,
        emailVerified: userData.authType === 'google', // Auto-verify emails for Google auth
        disabled: false
      });
      
      // Create user record in Firestore
      const newUser: User = {
        id: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName || userData.email?.split('@')[0],
        photoURL: userData.photoURL || null,
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
        lastLogin: firestore.Timestamp.now(),
        authType: userData.authType || 'email',
        isActive: true,
        googleId: userData.googleId || null
      };
      
      // Save to Firestore
      await this.usersCollection.doc(userRecord.uid).set(newUser);
      
      return newUser;
    } catch (error) {
      if (error instanceof Error) {
        // Check for specific Firebase Auth errors
        if (error.message.includes('already exists') || error.message.includes('email-already-exists')) {
          throw new Error('Email already in use');
        }
      }
      
      console.error('Error creating user:', error);
      throw new Error('Failed to create user account');
    }
  }

  /**
   * Login a user and generate a token
   * Only works for existing users, won't create new ones
   * 
   * @param email - The email of the user to login
   * @param displayName - Optional display name for updating user data
   * @returns A Promise that resolves to the user data and auth token
   */
  async loginUser(email: string, displayName?: string): Promise<{ user: User; token: string }> {
    try {
      // Step 1: Check if user exists in Firestore
      let user = await this.findUserByEmail(email);
      
      // Step 2: If not in Firestore, check Firebase Auth
      if (!user) {
        const firebaseUser = await this.getUserFromFirebaseAuth(email);
        
        // If exists in Firebase Auth but not in Firestore, create Firestore document
        if (firebaseUser) {
          console.log(`User exists in Firebase Auth but not in Firestore: ${firebaseUser.uid}`);
          
          // Create Firestore document with Firebase Auth UID
          const newUser: User = {
            id: firebaseUser.uid,
            email: email,
            displayName: displayName || firebaseUser.displayName || email.split('@')[0],
            photoURL: firebaseUser.photoURL || null,
            createdAt: firestore.Timestamp.now(),
            updatedAt: firestore.Timestamp.now(),
            lastLogin: firestore.Timestamp.now(),
            authType: 'email',
            isActive: true,
            googleId: null
          };
          
          // Save to Firestore using the Firebase Auth UID
          await this.usersCollection.doc(firebaseUser.uid).set(newUser);
          console.log(`Created Firestore record for existing Firebase Auth user: ${firebaseUser.uid}`);
          
          user = newUser;
        } else {
          // User not found in either system
          console.log(`User ${email} not found in either Firebase Auth or Firestore`);
          throw new Error('User not found');
        }
      }
      
      // Generate token for the user
      const token = await generateToken(user.id as string);
      
      // Update last login time
      await this.updateUser(user.id as string, {
        lastLogin: firestore.Timestamp.now()
      });
      
      return { user, token };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }
} 
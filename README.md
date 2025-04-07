# Atom Backend

Backend API for the Atom Task Management Application built with Firebase Cloud Functions and Express.js.

## Features

- RESTful API built with Express.js and TypeScript
- Deployed as Firebase Cloud Functions (v2)
- Firebase Firestore for data storage
- Multiple authentication methods:
  - JWT-based authentication
  - Google OAuth integration
- API Key validation for secure client-server communication
- CORS protection with whitelisted origins
- Error handling middleware
- Structured logging
- SOLID principles and Clean Architecture

## API Endpoints

| Method | Endpoint               | Description                          | Authentication |
|--------|------------------------|--------------------------------------|----------------|
| POST   | /api/auth/login        | Login with email                     | Public         |
| POST   | /api/auth/register     | Register new user                    | Public         |
| POST   | /api/auth/google       | Authenticate with Google ID token    | Public         |
| GET    | /api/auth/google/init  | Initiate server-side Google OAuth    | Public         |
| GET    | /api/auth/google/callback | Handle Google OAuth callback      | Public         |
| GET    | /api/tasks             | Get all tasks                        | Required       |
| POST   | /api/tasks             | Create a new task                    | Required       |
| GET    | /api/tasks/:id         | Get a specific task                  | Required       |
| PUT    | /api/tasks/:id         | Update a task                        | Required       |
| DELETE | /api/tasks/:id         | Delete a task                        | Required       |
| GET    | /health                | Service health check                 | Public         |

## Project Structure

```
├── src/
│   ├── controllers/      # Request handlers (auth, task)
│   ├── services/         # Business logic and data access
│   ├── models/           # Data models (user, task)
│   ├── routes/           # API routes definition
│   ├── middlewares/      # Middleware (error, auth, validation, apikey)
│   ├── config/           # Configuration files (Firebase)
│   │   └── credentials/  # Firebase credentials (gitignored)
│   ├── utils/            # Utility functions
│   └── server.ts         # Application entry point
├── functions/            # Firebase Cloud Functions configuration
│   ├── index.js          # Cloud Functions entry point
│   └── package.json      # Functions-specific dependencies
├── dist/                 # Compiled TypeScript output
├── public/               # Static files
├── .env.example          # Environment variables template
├── firebase.json         # Firebase configuration
├── firestore.rules       # Firestore security rules
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Architecture

The application follows a clean, layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic and interact with data layer
- **Models**: Define data structures
- **Middlewares**: Process requests before they reach route handlers
- **Routes**: Define API endpoints and their handlers
- **Utils**: Provide helper functions across the application

## Cloud Functions Deployment

The backend is deployed as a Firebase Cloud Function (v2) with the following configuration:

- **Function Name**: atom
- **Region**: us-central1
- **Runtime**: Node.js 20
- **Memory**: Default (256MB)
- **Timeout**: Default (60s)
- **Entry Point**: Express.js application

The setup includes a middleware that handles the `/atom` URL prefix automatically, allowing both direct API URL access and Cloud Functions URL format to work seamlessly.

## Authentication System

### Email Authentication
Users can register and login with their email address. The system generates JWT tokens for session management.

### Google Authentication
Two methods of Google authentication are supported:

1. **Client-side flow**: Frontend obtains a Google ID token and sends it to `/api/auth/google` for verification
2. **Server-side flow**: Backend initiates OAuth flow via `/api/auth/google/init` and handles the callback

### API Key Security
The system implements API key validation with two modes:

1. **Auto-injection**: Trusted origins (frontend URLs) automatically receive API keys
2. **Manual validation**: External requests (like Postman) must provide valid API keys in headers

## Getting Started

### Prerequisites

- Node.js (v20 or later recommended)
- npm or yarn
- Firebase project with Firestore

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd atom-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Set up Firebase:
   - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
   - Set up Firestore database in your project
   - Enable Google Authentication in Firebase Authentication section
   - Go to Project Settings > Service Accounts > Generate New Private Key
   - Create the credentials directory and save the JSON file:
   ```bash
   mkdir -p src/config/credentials
   # Move your downloaded JSON file to this directory
   mv ~/Downloads/your-firebase-credentials.json src/config/credentials/app-credentials.json
   ```
   - Set GOOGLE_APPLICATION_CREDENTIALS in your `.env` file:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./src/config/credentials/app-credentials.json
   ```

5. Configure API Keys:
   - For local development, set DEFAULT_API_KEY in your .env file
   - For production, configure API keys in the Cloud Run service:
   ```bash
   gcloud run services update atom --set-env-vars DEFAULT_API_KEY="your-api-key" --region=us-central1
   ```

### Development

Run the development server:
```bash
npm run dev
```

### Building for Production

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Deployment to Firebase Cloud Functions

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Build and deploy:
```bash
npm run build
cd functions
firebase deploy --only functions
```

After deployment, your API will be available at:
```
https://atom-dqytahs6oq-uc.a.run.app
```

## Environment Variables

The following environment variables are required:

| Variable                      | Description                               | Required for                 |
|-------------------------------|-------------------------------------------|------------------------------|
| GOOGLE_APPLICATION_CREDENTIALS| Path to Firebase credentials JSON file    | Local development            |
| DEFAULT_API_KEY               | Default API key for validation            | Production & development     |
| FIREBASE_PROJECT_ID           | Firebase project ID                       | Development & production     |
| GOOGLE_CLIENT_ID              | Google OAuth client ID                    | Google Authentication        |
| GOOGLE_CLIENT_SECRET          | Google OAuth client secret                | Google Authentication        |
| JWT_SECRET                    | Secret for JWT token generation           | Authentication system        |
| CORS_ORIGIN                   | Allowed origins for CORS                  | Cross-origin requests        |

## Firestore Data Model

### Users Collection
```
users/{userId}
  - id: string
  - email: string
  - displayName: string (optional)
  - photoURL: string (optional)
  - authType: 'email' | 'google'
  - googleId: string (for Google auth only)
  - createdAt: timestamp
  - updatedAt: timestamp
  - lastLogin: timestamp
  - isActive: boolean
```

### Tasks Collection
```
tasks/{taskId}
  - id: string
  - userId: string (reference to user)
  - title: string
  - description: string
  - priority: 'low' | 'medium' | 'high'
  - status: 'pending' | 'in-progress' | 'completed'
  - dueDate: timestamp (optional)
  - tags: string[] (optional)
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Security

- All API routes (except public ones) require authentication
- Firestore security rules ensure users can only access their own data
- Environment variables protect sensitive information
- API Key validation secures backend access

- Created by Margareth Ortiz
- 04-07-2025

# Atom Backend

Backend API for the Atom Task Management Application.

## Features

- RESTful API built with Express.js and TypeScript
- Firebase Firestore for data storage
- JWT-based authentication
- SOLID principles and Clean Architecture

## API Endpoints

| Method | Endpoint         | Description                    | Authentication |
|--------|------------------|--------------------------------|----------------|
| POST   | /api/auth/login   | Login user                     | Public         |
| POST   | /api/auth/register| Register new user              | Public         |
| GET    | /api/tasks        | Get all tasks                  | Required       |
| POST   | /api/tasks        | Create a new task              | Required       |
| GET    | /api/tasks/:id    | Get a specific task            | Required       |
| PUT    | /api/tasks/:id    | Update a task                  | Required       |
| DELETE | /api/tasks/:id    | Delete a task                  | Required       |

## Project Structure

```
├── src/
│   ├── controllers/      # Request handlers (auth, task)
│   ├── services/         # Business logic and data access
│   ├── models/           # Data models (user, task)
│   ├── routes/           # API routes (auth, task)
│   ├── middlewares/      # Middleware (error, authentication)
│   ├── config/           # Configuration files (Firebase)
│   │   └── credentials/  # Firebase credentials (gitignored)
│   ├── utils/            # Utility functions
│   └── server.ts         # Application entry point
├── functions/            # For Firebase Cloud Functions deployment
├── public/               # Static files
├── .env.example          # Environment variables template
├── firebase.json         # Firebase configuration
├── firestore.rules       # Firestore security rules
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
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
   - Note: The credentials directory is already in .gitignore to prevent accidental commits

### Testing the API

1. Start the development server:
```bash
npm run dev
```

2. Test the API endpoints with a REST client like Postman, Insomnia, or curl:

   - Check if the server is running:
   ```bash
   curl http://localhost:3000/health
   ```

   - Register a new user:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123"}'
   ```

   - Login to get a JWT token:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123"}'
   ```

   - Create a task (use the token from login):
   ```bash
   curl -X POST http://localhost:3000/api/tasks \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"title": "Test Task", "description": "This is a test task", "priority": "medium"}'
   ```

   - Get all tasks:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/tasks
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

2. Initialize Firebase:
```bash
firebase login
firebase init functions
```

3. Deploy to Firebase:
```bash
firebase deploy --only functions
```

## Authentication

The API uses JWT tokens for authentication. To access protected endpoints:

1. Login with your email to get a token
2. Add the token to your request headers:
```
Authorization: Bearer <your-token>
```

# Created by Margareth Ortiz 
# 04-03-2025

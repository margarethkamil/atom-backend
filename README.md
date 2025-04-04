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
src/
├── controllers/     # Request handlers
├── services/        # Business logic and data access
├── models/          # Data models and interfaces
├── routes/          # API routes
├── middlewares/     # Authentication and validation
├── config/          # Configuration files
├── utils/           # Utility functions
└── server.ts        # Application entry point
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
   - Create a Firebase project
   - Set up Firestore
   - Download service account key and save it securely
   - Set GOOGLE_APPLICATION_CREDENTIALS in your `.env` file

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

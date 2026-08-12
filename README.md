# User Management API

A production-ready User Management REST API built with Node.js, Express, TypeScript, MongoDB (Mongoose), and Zod.

## Setup

1. Install dependencies:
npm install

2. Environment:
Copy .env.example to .env:
Default values in .env.example:

PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/user_management

3. Run project:
npm run dev    # Development
npm run build  # Build
npm start      # Production
npm test       # Run tests

## Endpoints

- GET /health
- GET /api/v1/users (supports page, limit, search)
- GET /api/v1/users/:id
- POST /api/v1/users
- PUT /api/v1/users/:id
- DELETE /api/v1/users/:id

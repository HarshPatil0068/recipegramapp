# RecipeGram – Setup Guide

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [MongoDB](https://www.mongodb.com/) (local instance or Atlas connection string)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/harshhpatil/recipegramapp.git
cd recipegramapp
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Install server dependencies

```bash
cd server
npm install
```

### 4. Install client dependencies

```bash
cd ../client
npm install
```

## Environment Variables

### Server (`server/.env`)

Create a `server/.env` file based on `server/.env.example`:

| Variable       | Required | Default                                    | Description                          |
|----------------|----------|--------------------------------------------|--------------------------------------|
| `PORT`         | No       | `5000`                                     | Port the server listens on           |
| `MONGODB_URI`  | No       | `mongodb://localhost:27017/recipegram`     | MongoDB connection URI               |
| `JWT_SECRET`   | **Yes**  | –                                          | Secret key for JWT signing           |
| `CLIENT_URL`   | No       | `http://localhost:5173`                    | Allowed CORS origin                  |
| `NODE_ENV`     | No       | `development`                              | Runtime environment                  |

### Client (`client/.env`)

Create a `client/.env` file:

| Variable            | Default                  | Description             |
|---------------------|--------------------------|-------------------------|
| `VITE_API_URL`      | `http://localhost:5000`  | Backend API base URL    |

## Running the Application

### Development

```bash
# Terminal 1 – start the server
cd server
npm run dev

# Terminal 2 – start the client
cd client
npm run dev
```

The client will be available at `http://localhost:5173` and the server at `http://localhost:5000`.

### Using Docker Compose

```bash
docker-compose up --build
```

## Running Tests

```bash
# Backend tests
cd server
npm test -- --run

# Frontend tests
cd client
npm test -- --run
```

## Project Structure

```
recipegramapp/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # Axios API service layer
│   │   └── utils/           # Shared utilities (logger, etc.)
│   └── ...
└── server/                  # Express backend
    ├── src/
    │   ├── config/          # Database + environment configuration
    │   ├── controller/      # Route handler logic
    │   ├── middleware/       # Auth, validation, rate limiting, CORS
    │   ├── models/          # Mongoose data models
    │   ├── routes/          # Route definitions (index.js = registry)
    │   ├── util/            # Logger, socket, notification helpers
    │   └── utils/           # Shared utilities (response helpers)
    └── ...
```

## Development Guidelines

- Follow the commit convention described in [`.github/COMMIT_CONVENTION.md`](.github/COMMIT_CONVENTION.md).
- All API responses must use `{ success: true|false, data: ... }` shape.
- Use `server/src/utils/response.js` helpers (`successResponse`, `errorResponse`) for new endpoints.
- Environment variables must be consumed via `server/src/config/env.js`.
- New routes must be registered in `server/src/routes/index.js`.

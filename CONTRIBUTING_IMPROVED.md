# Contributing to RecipeGram

Thank you for your interest in contributing! Please read this guide before submitting a pull request.

## Getting Started

1. Fork the repository and clone your fork.
2. Follow the setup instructions in [`README_SETUP.md`](README_SETUP.md).
3. Create a new branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

## Project Structure

```
recipegramapp/
├── client/           # React + Vite frontend
└── server/           # Express + Mongoose backend
    └── src/
        ├── config/   # env.js (env vars), dbConnection.js
        ├── routes/   # index.js (route registry) + individual route files
        └── utils/    # response.js (API response helpers)
```

## Code Standards

- **Commit messages** – follow [`.github/COMMIT_CONVENTION.md`](.github/COMMIT_CONVENTION.md).
- **API responses** – use `successResponse` / `errorResponse` from `server/src/utils/response.js`.
- **Environment variables** – consume via `server/src/config/env.js`, never `process.env` directly.
- **Routes** – register new routes in `server/src/routes/index.js`.
- **Linting** – run `eslint` before committing; configs are in `server/.eslintrc.json` and `client/.eslintrc.json`.

## Development Workflow

1. Make your changes in a focused branch.
2. Run tests:
   ```bash
   # Backend
   cd server && npm test -- --run

   # Frontend
   cd client && npm test -- --run
   ```
3. Ensure there are no linting errors.
4. Open a pull request against `main` with a clear description of your changes.

## Reporting Issues

Please open an issue with:
- Steps to reproduce
- Expected vs. actual behaviour
- Environment details (Node version, OS)

import express from 'express';
const app = express();

// Import middleware
import corsMiddleware from './middleware/cors.middleware.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Import centralized route registry
import { registerRoutes } from './routes/index.js';

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register all routes
// Note: Route-specific rate limiters (authLimiter, searchLimiter, createPostLimiter)
// are applied directly to their respective routes for targeted protection
registerRoutes(app);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'RecipeGram API is running!',
        version: '1.0.0'
    });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
import express from 'express';
const app = express();

// Import middleware
import corsMiddleware from './middleware/cors.middleware.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Import routes
import authRoutes from './routes/auth.routes.js';

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Note: Route-specific rate limiters (authLimiter, searchLimiter, createPostLimiter) 
// are applied directly to their respective routes for targeted protection
app.use('/auth', authRoutes);


import testRoutes from "./routes/test.routes.js";
app.use("/test", testRoutes);

import postRoutes from "./routes/post.routes.js";
app.use("/posts", postRoutes);

import likeRoutes from "./routes/like.routes.js";
app.use("/likes", likeRoutes);

import commentRoutes from "./routes/comment.routes.js";
app.use("/comments", commentRoutes);


import followRoutes from "./routes/follow.routes.js";
app.use("/follow", followRoutes);

import userRoutes from "./routes/user.routes.js";
app.use("/users", userRoutes);

import saveRoutes from "./routes/save.routes.js";
app.use("/save", saveRoutes);

import notificationRoutes from "./routes/notification.routes.js";
app.use("/api/notifications", notificationRoutes);

import messageRoutes from "./routes/message.routes.js";
app.use("/messages", messageRoutes);

import aiRoutes from "./routes/ai.routes.js";
app.use("/ai", aiRoutes);

app.get('/', (req, res)=>{
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
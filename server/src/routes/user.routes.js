import express from 'express';
import { 
  getCurrentUser,
  getUserProfile, 
  updateUserProfile, 
  getUserPosts,
  searchUsers 
} from '../controller/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { searchLimiter } from '../middleware/rateLimiter.middleware.js';
import { uploadSingleFile } from '../middleware/upload.middleware.js';

const router = express.Router();

// Get current user (must be before other routes to avoid conflicts)
router.get('/me', authenticate, getCurrentUser);

// Search users (must be before /:username)
router.get('/search', searchLimiter, searchUsers);

// Update user profile (authenticated)
router.put('/profile', authenticate, uploadSingleFile, updateUserProfile);

// Get user's posts
router.get('/:userId/posts', getUserPosts);

// Get user profile (public) - must be last to avoid matching other routes
router.get('/:username', getUserProfile);

export default router;

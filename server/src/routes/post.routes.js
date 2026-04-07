import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { validatePost, validatePostUpdate } from "../middleware/validation.middleware.js";
import { uploadSingleFile } from "../middleware/upload.middleware.js";
import { createPost, getFeed, getAllPosts, getPostById, updatePost, deletePost, searchPosts, getTrendingPosts, getReels } from "../controller/post.controller.js";
import { uploadFile, deleteFile } from "../controller/upload.controller.js";

const router = express.Router();

// Upload routes - these should come first
router.post("/upload", authMiddleware, uploadSingleFile, uploadFile);
router.delete("/upload/:publicId", authMiddleware, deleteFile);

// Specific routes should come before parameterized routes
router.post("/", authMiddleware, validatePost, createPost);
router.get("/feed", authMiddleware, getFeed);
router.get("/reels", authMiddleware, getReels);
router.get("/search", authMiddleware, searchPosts);
router.get("/trending", authMiddleware, getTrendingPosts);
router.get("/", authMiddleware, getAllPosts);
router.get("/:id", authMiddleware, getPostById);
router.put("/:id", authMiddleware, validatePostUpdate, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;

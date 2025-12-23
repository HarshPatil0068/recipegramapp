import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createPost, getFeed } from "../controller/post.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/feed", authMiddleware, getFeed);

export default router;

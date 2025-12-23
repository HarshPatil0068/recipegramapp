import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { toggleLike } from "../controller/like.controller.js";

const router = express.Router();

router.post("/:postId", authMiddleware, toggleLike);

export default router;

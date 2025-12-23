import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { addComment, getComments } from "../controller/comment.controller.js";

const router = express.Router();

router.post("/:postId", authMiddleware, addComment);
router.get("/:postId", authMiddleware, getComments);

export default router;

import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { toggleSavePost } from "../controller/save.controller.js";

const router = express.Router();

router.post("/:postId", authMiddleware, toggleSavePost);

export default router;

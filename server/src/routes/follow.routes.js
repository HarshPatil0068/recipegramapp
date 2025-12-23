import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { toggleFollow } from "../controller/follow.controller.js";

const router = express.Router();

router.post("/:userId", authMiddleware, toggleFollow);

export default router;

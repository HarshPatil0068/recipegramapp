import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getNotifications,
  markAsRead
} from "../controller/notification.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.patch("/:notificationId/read", authMiddleware, markAsRead);

export default router;

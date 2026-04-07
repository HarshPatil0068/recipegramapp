import express from "express";
import { register, login } from "../controller/auth.controller.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";
import { validateRegistration, validateLogin } from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);

export default router;
    
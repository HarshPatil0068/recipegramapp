import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { suggestRecipesFromIngredients } from "../controller/ai.controller.js";

const router = express.Router();

router.post("/recipes/suggest", authMiddleware, suggestRecipesFromIngredients);

export default router;

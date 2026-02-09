import express from "express";
import { handleChat } from "../controllers/chatbot.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { guestChatLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

/**
 * POST /api/chatbot/chat
 * Main endpoint for chat messages
 *
 * Middleware:
 * - optionalAuth: Sets req.user if logged in (doesn't block guests)
 * - guestChatLimiter: Limits guests to 3 messages/24h
 *
 * Body:
 * - message: string (required) - The user's message
 * - history: array (optional) - Previous conversation history
 */
router.post("/chat", optionalAuth, guestChatLimiter, handleChat);

export default router;

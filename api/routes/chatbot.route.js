import express from "express";
import { handleChat } from "../controllers/chatbot.controller.js";

const router = express.Router();

/**
 * POST /api/chatbot/chat
 * Main endpoint for chat messages
 *
 * Body:
 * - message: string (required) - The user's message
 * - history: array (optional) - Previous conversation history
 */
router.post("/chat", handleChat);

export default router;

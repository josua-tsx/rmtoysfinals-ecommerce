import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  getStoreInfo,
  updateStoreInfo,
} from "../controllers/storeInfo.controller.js";

const router = express.Router();

/**
 * =============================================================================
 * STORE INFO ROUTES
 * =============================================================================
 * 
 * These routes manage the store's configuration that feeds into the AI chatbot.
 * 
 * GET  /api/store-info  - Public (anyone can see store info)
 * PUT  /api/store-info  - Admin only (update store configuration)
 */

// Public: Get store information
router.get("/", getStoreInfo);

// Admin only: Update store information
router.put("/", requireAuth, requireAdmin, updateStoreInfo);

export default router;

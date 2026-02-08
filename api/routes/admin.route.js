import express from "express";
import { resetDatabase } from "../controllers/admin.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// ⚠️ DANGEROUS: Reset entire database (preserves admin accounts and store info)
router.delete("/reset-database", requireAuth, requireAdmin, resetDatabase);

export default router;

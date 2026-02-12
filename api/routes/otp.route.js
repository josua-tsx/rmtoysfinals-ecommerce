import express from "express";
import { strictLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { sendOtp, verifyOtp, confirmIdentityVerification } from "../controllers/otp.controller.js";

const router = express.Router();

// POST /api/otp/send — rate-limited to 3/hour (reuses strictLimiter)
router.post("/send", strictLimiter, sendOtp);

// POST /api/otp/verify
router.post("/verify", verifyOtp);

// POST /api/otp/confirm-identity — requires auth
router.post("/confirm-identity", requireAuth, confirmIdentityVerification);

export default router;

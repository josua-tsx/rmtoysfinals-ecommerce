import express from "express";
import { strictLimiter } from "../middleware/rateLimiter.js";
import { sendGuestOtp, verifyGuestOtp } from "../controllers/otp.controller.js";

const router = express.Router();

// POST /api/otp/send — rate-limited to 3/hour (reuses strictLimiter)
router.post("/send", strictLimiter, sendGuestOtp);

// POST /api/otp/verify
router.post("/verify", verifyGuestOtp);

export default router;

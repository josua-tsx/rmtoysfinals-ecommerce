import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { subscribeEmail } from "../controllers/subscribe.controller.js";

const router = express.Router();

router.post(`/subscribe-email`, requireAuth, requireAdmin, subscribeEmail);

export default router;

import express from "express";

import { playRps, resetLock } from "../controllers/random.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(`/play`, requireAuth, playRps);
router.post(`/reset`, requireAuth, resetLock);

export default router;

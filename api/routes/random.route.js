import express from "express";

import { playRps } from "../controllers/random.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(`/play`, requireAuth, playRps);

export default router;

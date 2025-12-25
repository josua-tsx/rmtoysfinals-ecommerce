import express from 'express';
import { generateContent, getDashboardSummary, generateProductDescription } from '../controllers/gemini.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/generate', generateContent);
router.get('/dashboard-summary', requireAuth, requireAdmin, getDashboardSummary);
router.post('/generate-product-description', requireAuth, requireAdmin, generateProductDescription);

export default router;

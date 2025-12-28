import express from 'express';
import { generateContent, getDashboardSummary, generateProductDescription, generateTicketReply, searchProductsWithAI, summarizeProductReviews } from '../controllers/gemini.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/generate', generateContent);
router.get('/dashboard-summary', requireAuth, requireAdmin, getDashboardSummary);
router.post('/generate-product-description', requireAuth, requireAdmin, generateProductDescription);
router.post('/generate-ticket-reply', requireAuth, requireAdmin, generateTicketReply);
router.post('/search-products', searchProductsWithAI); // Public endpoint for customer search
router.get('/summarize-reviews/:productId', summarizeProductReviews); // Public endpoint for review summary

export default router;

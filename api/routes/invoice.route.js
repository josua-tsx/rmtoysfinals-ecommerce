import express from 'express';
import { getInvoicePdf } from '../controllers/invoice.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/invoice/:orderId - Generate and download invoice PDF
router.get('/:orderId', requireAuth, getInvoicePdf);

export default router;

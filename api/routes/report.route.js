import express from 'express';
import {
  getSalesReportPdf,
  getOrdersReportPdf,
  getInventoryReportPdf,
} from '../controllers/report.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All report routes require authentication and admin privileges
router.get('/sales', requireAuth, requireAdmin, getSalesReportPdf);
router.get('/orders', requireAuth, requireAdmin, getOrdersReportPdf);
router.get('/inventory', requireAuth, requireAdmin, getInventoryReportPdf);

export default router;

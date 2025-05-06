import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  deleteAllHistory,
  getOrderStockHistory,
  orderStockLogs,
} from "../controllers/orderStockHistory.contoller.js";

const router = express.Router();

router.post(`/`, requireAuth, requireAdmin, orderStockLogs);
router.get(`/get-stock-history`, getOrderStockHistory);
router.delete(`/delete-all-history`, deleteAllHistory);

export default router;

import express from "express";
import {
  // confirmDelivery,
  getPendingDeliveries,
  getSingleStock,
  getStockLevels,
  getStocks,
  OrderStocks,
  reorderStock,
  updateStockQuantity,
} from "../controllers/stocks.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(`/new-deliver`, requireAuth, requireAdmin, OrderStocks);

router.get(
  "/get-processingStocks",
  requireAuth,
  requireAdmin,
  getPendingDeliveries
);

router.put(`/reOrder-stock/:stockId`, requireAuth, requireAdmin, reorderStock)

// router.put(`/set-as-delivered/:deliveryId`, requireAuth, requireAdmin, confirmDelivery);

router.get("/get-stocks", getStocks);
// router.delete("/delete-stock/:stockId", deleteStock)
router.get(`/get-stock/:stockId`, getSingleStock);

router.put(`/update-quantity/:stockId`, updateStockQuantity)

router.get(`/get-stocks-levels`, getStockLevels);

export default router;

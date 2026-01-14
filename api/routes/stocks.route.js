import express from "express";
import {
  getPendingDeliveries,
  getSingleStock,
  getStockLevels,
  getStocks,
  OrderStocks,
  reorderStock,
  updateStockQuantity,
} from "../controllers/stocks.controller.js";

import { validateResource } from "../middleware/validateResource.js";
import { orderStockSchema, reorderStockSchema, updateStockQuantitySchema } from "../schema/stock.schema.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();



router.post("/order-stock", requireAuth, requireAdmin, validateResource(orderStockSchema), OrderStocks);
router.get("/get-stock", requireAuth, requireAdmin, getStocks);
router.get("/get-stock-levels", requireAuth, requireAdmin, getStockLevels);
router.get("/get-pending", requireAuth, requireAdmin, getPendingDeliveries);
router.get("/get-single-stock/:stockId", requireAuth, requireAdmin, getSingleStock);
router.post("/reorder-stock/:stockId", requireAuth, requireAdmin, validateResource(reorderStockSchema), reorderStock);
router.put("/update-stock-quantity/:stockId", requireAuth, requireAdmin, validateResource(updateStockQuantitySchema), updateStockQuantity);

export default router;

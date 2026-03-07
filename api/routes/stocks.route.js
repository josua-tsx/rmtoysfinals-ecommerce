
import express from "express";
import { csvUpload } from "../middleware/csvUpload.js";
import {
  getPendingDeliveries,
  getSingleStock,
  getStockLevels,
  getStocks,
  OrderStocks,
  updateStockQuantity,
  getStockCsvTemplate,
  batchOrderStocks,
} from "../controllers/stocks.controller.js";

import { validateResource } from "../middleware/validateResource.js";
import { orderStockSchema,  updateStockQuantitySchema } from "../schema/stock.schema.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();




router.post("/order-stock", requireAuth, requireAdmin, validateResource(orderStockSchema), OrderStocks);
router.get("/get-stocks", requireAuth, requireAdmin, getStocks);
router.get("/get-stock-levels", requireAuth, requireAdmin, getStockLevels);
router.get("/get-pending", requireAuth, requireAdmin, getPendingDeliveries);
router.get("/get-single-stock/:productId", requireAuth, requireAdmin, getSingleStock);
router.patch("/update-stock-quantity/:productId", requireAuth, requireAdmin, validateResource(updateStockQuantitySchema), updateStockQuantity); 
// Batch Routes
router.get("/csv-template", requireAuth, requireAdmin, getStockCsvTemplate);
router.post("/batch-order", requireAuth, requireAdmin, csvUpload.single("file"), batchOrderStocks);

export default router;

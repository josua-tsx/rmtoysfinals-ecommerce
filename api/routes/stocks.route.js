import express from 'express'
import { addStocks,  editStock, getSingleStock, getStockLevels, getStocks } from '../controllers/stocks.controller.js'
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post("/add-stocks", requireAuth, requireAdmin, addStocks)
router.get("/get-stocks", getStocks)
// router.delete("/delete-stock/:stockId", deleteStock)
router.put("/edit-stock/:stockId", requireAuth, requireAdmin, editStock)
router.get(`/get-stock/:stockId`, getSingleStock)

router.get(`/get-stocks-levels`, getStockLevels)


export default router
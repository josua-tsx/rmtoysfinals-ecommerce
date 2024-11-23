import express from 'express'
import { addStocks,  editStock, getSingleStock, getStocks } from '../controllers/stocks.controller.js'

const router = express.Router()

router.post("/add-stocks", addStocks)
router.get("/get-stocks", getStocks)
// router.delete("/delete-stock/:stockId", deleteStock)
router.put("/edit-stock/:stockId", editStock)
router.get(`/get-stock/:stockId`, getSingleStock)

export default router
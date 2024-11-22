import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  addReason,
  getAllOrder,
  getDeliveredCancelled,
  getSingleUserOrder,
  getUserOrder,
  updateDeliveryStatus,
  updatePaymentStatus,
  userPlaceOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post(`/place-order`, requireAuth, userPlaceOrder);

router.put(`/add-reason/:orderId`, requireAuth, requireAdmin , addReason);

router.get(`/get-userOrder`, requireAuth, getUserOrder);

router.get(`/get-orders`, getAllOrder);

router.put(`/:orderId/paymentStatus`, requireAuth, requireAdmin ,updatePaymentStatus)

router.get(`/get-deliveredCancelled`, requireAuth, getDeliveredCancelled )

router.put(`/:orderId/status`, requireAuth, requireAdmin, updateDeliveryStatus)

// router.get(`/:orderId`, requireAuth, requireAdmin , getSingleUserOrder);
router.get(`/:orderId`,  getSingleUserOrder);

export default router;

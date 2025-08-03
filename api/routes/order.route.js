import express from "express";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  addReason,
  adminOrderRefund,
  cancelSuccessTransact,
  checkOutSuccess,
  getAllCancelled,
  getAllFailed,
  getAllOrder,
  getAllRefunded,
  getAllSuccess,
  getLatestCancelledOrder,
  getLatestFailedOrder,
  getLatestRefundedOrder,
  getLatestSuccessOrder,
  getMonthlySales,
  getSingleUserOrder,
  getUserCancelled,
  getUserDelivered,
  getUserFailed,
  getUserOrder,
  getUserRefund,
  guestOrderStripe,
  placeOrderGcashQR,
  placeOrderStripe,
  updateDeliveryStatus,
  updatePaymentStatus,
  userCancelOrder,
  userPlaceOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post(`/place-order`, requireAuth, userPlaceOrder);

router.post(`/place-order-stripe`, requireAuth, placeOrderStripe)

router.post(`/place-guest-stripe`,  guestOrderStripe)

router.post(`/place-order-gcashQR`, requireAuth, placeOrderGcashQR)

router.post(`/checkout-success`, requireAuth, checkOutSuccess)

router.put(`/add-reason/:orderId`, requireAuth, requireAdmin , addReason);

router.get(`/get-userOrder`, requireAuth, getUserOrder);

router.get(`/get-orders`, getAllOrder);

router.get(`/get-successOrder`, getAllSuccess)

router.get(`/get-failedCancelled`, getAllFailed)

router.get(`/get-refundedCancelled`, getAllRefunded)

router.get(`/get-cancelled`, getAllCancelled)

router.get(`/monthly/sales`, getMonthlySales)

router.get(`/latest/success`, getLatestSuccessOrder)

router.get(`/latest/failed`, getLatestFailedOrder)

router.get(`/latest/refunded`, getLatestRefundedOrder)

router.get(`/latest/cancelled`, getLatestCancelledOrder)

router.put(`/:orderId/paymentStatus`, requireAuth, requireAdmin ,updatePaymentStatus)

router.put(`/cancel-success-transact`, requireAuth, requireAdmin ,cancelSuccessTransact)

router.put(`/refund-order`, adminOrderRefund)

router.put(`/user/cancel-order`, requireAuth, userCancelOrder)

router.get(`/get-userDelivered`, requireAuth, getUserDelivered)

router.get(`/get-userCancelled`, requireAuth, getUserCancelled)

router.get(`/get-userRefunded`, requireAuth, getUserRefund)

router.get(`/get-userFailed`, requireAuth, getUserFailed)

router.put(`/:orderId/status`, requireAuth, requireAdmin, updateDeliveryStatus)

// router.get(`/:orderId`, requireAuth, requireAdmin , getSingleUserOrder);
router.get(`/:orderId`,  getSingleUserOrder);

export default router;

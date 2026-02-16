import express from "express";
import { validateResource } from "../middleware/validateResource.js";
import { placeOrderSchema, updateOrderStatusSchema } from "../schema/order.schema.js";
import { guestOrderLimiter } from "../middleware/rateLimiter.js";
import {
  optionalAuth,
  requireAdmin,
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  addReason,
  adminOrderRefund,
  cancelSuccessTransact,

  // checkOutSuccess,
  deleteAllOrders,
  getAllCancelled,
  getAllFailed,
  getAllOrder,
  getAllRefunded,
  getAllSuccess,
  getAllUntracked,
  getFiveUserDelivered,
  getGuestOrder,
  getLatestCancelledOrder,
  getLatestFailedOrder,
  getLatestRefundedOrder,
  getLatestSuccessOrder,
  // getMonthlySales,
  getPendingPayments,
  getSalesAnalytics,
  getSingleUserOrder,
  getUserCancelled,
  getUserDelivered,
  getUserFailed,
  getUserOrder,
  getUserRefund,
  getUsersOrder,
  placeOrderGcashQR,
  // placeOrderStripe,
  searchOrders,
  trackSingleOrder,
  updateDeliveryStatus,
  updatePaymentStatus,
  updateTrackStatus,
  userCancelOrder,
  // userPlaceOrder,
  validateGuestOrder,

} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/analytics", requireAuth, requireAdmin, getSalesAnalytics);

router.post(`/place-order`, requireAuth, validateResource(placeOrderSchema), userPlaceOrder);

// router.post(`/place-order-stripe`, optionalAuth, guestOrderLimiter, placeOrderStripe);

router.post(`/place-order-gcashQR`, optionalAuth, guestOrderLimiter, placeOrderGcashQR);

router.post("/validate-guest", guestOrderLimiter, validateGuestOrder)

// router.post(`/checkout-success`, optionalAuth, checkOutSuccess);

router.put(`/add-reason/:orderId`, requireAuth, requireAdmin, addReason);

router.get(`/get-userOrder`, requireAuth, getUserOrder);

router.get(`/get-all-orders`, getAllOrder);

router.get(`/get-orders`, getUsersOrder);

router.get(`/get-guest-orders`, getGuestOrder);

router.get(`/get-successOrder`, getAllSuccess);

router.get(`/get-failedCancelled`, getAllFailed);

router.get(`/get-refundedCancelled`, getAllRefunded);

router.get(`/get-cancelled`, getAllCancelled);

// Validator Dashboard - Orders needing payment validation
router.get(`/get-pending-payments`, requireAuth, requireAdmin, getPendingPayments);

// router.get(`/monthly/sales`, getMonthlySales);

router.get(`/latest/success`, getLatestSuccessOrder);

router.get(`/latest/failed`, getLatestFailedOrder);

router.get(`/latest/refunded`, getLatestRefundedOrder);

router.get(`/latest/cancelled`, getLatestCancelledOrder);

router.post("/search-order", optionalAuth, guestOrderLimiter, searchOrders);

router.put(
  `/:orderId/paymentStatus`,
  requireAuth,
  requireAdmin,
  updatePaymentStatus,
);

router.put(
  `/cancel-success-transact`,
  requireAuth,
  requireAdmin,
  cancelSuccessTransact
);

router.put(`/refund-order`, adminOrderRefund);

router.put(`/user/cancel-order`, requireAuth, userCancelOrder);

router.get(`/get-userDelivered`, requireAuth, getUserDelivered);

router.get(`/get-userFiveDelivered`, requireAuth, getFiveUserDelivered);

router.get(`/get-userCancelled`, requireAuth, getUserCancelled);

router.get(`/get-userRefunded`, requireAuth, getUserRefund);

router.get(`/get-userFailed`, requireAuth, getUserFailed);

router.get("/get-untracked-orders", getAllUntracked)

router.put(
  `/:orderId/status`, 
  optionalAuth,
  requireAdmin,
  validateResource(updateOrderStatusSchema),
  updateDeliveryStatus
); 

router.put("/update-track-status/:orderId", updateTrackStatus)

router.delete("/delete-orders", requireAuth, requireAdmin, deleteAllOrders)

// router.get(`/:orderId`, requireAuth, requireAdmin , getSingleUserOrder);
router.get(`/:orderId`, getSingleUserOrder);

router.post("/track-order/:orderId", trackSingleOrder)



export default router;

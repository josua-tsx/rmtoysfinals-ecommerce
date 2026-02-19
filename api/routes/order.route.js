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
  userPlaceOrder,
  validateGuestOrder,

} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/analytics", requireAuth, requireAdmin, getSalesAnalytics);

router.post(`/place-order`, requireAuth, validateResource(placeOrderSchema), userPlaceOrder);

// router.post(`/place-order-stripe`, optionalAuth, guestOrderLimiter, placeOrderStripe);

router.post(`/place-order-gcashQR`, optionalAuth, guestOrderLimiter, validateResource(placeOrderSchema), placeOrderGcashQR);

router.post("/validate-guest", guestOrderLimiter, validateGuestOrder)

// router.post(`/checkout-success`, optionalAuth, checkOutSuccess);

router.put(`/add-reason/:orderId`, requireAuth, requireAdmin, addReason);

router.get(`/get-userOrder`, requireAuth, getUserOrder);

router.get(`/get-all-orders`, requireAuth, getAllOrder);

router.get(`/get-orders`, requireAuth, getUsersOrder);

router.get(`/get-guest-orders`, requireAuth, getGuestOrder);

router.get(`/get-successOrder`, requireAuth,  getAllSuccess);

router.get(`/get-failedCancelled`, requireAuth,  getAllFailed);

router.get(`/get-refundedCancelled`, requireAuth, getAllRefunded);

router.get(`/get-cancelled`, requireAuth,  getAllCancelled);

// Validator Dashboard - Orders needing payment validation
router.get(`/get-pending-payments`, requireAuth, requireAdmin, getPendingPayments);

// router.get(`/monthly/sales`, getMonthlySales);

router.get(`/latest/success`, requireAuth,  getLatestSuccessOrder);

router.get(`/latest/failed`, requireAuth, getLatestFailedOrder);

router.get(`/latest/refunded`, requireAuth, getLatestRefundedOrder);

router.get(`/latest/cancelled`, requireAuth,  getLatestCancelledOrder);

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

router.put(`/refund-order`, requireAuth, adminOrderRefund);

router.put(`/user/cancel-order`, requireAuth, userCancelOrder);

router.get(`/get-userDelivered`, requireAuth, getUserDelivered);

router.get(`/get-userFiveDelivered`, requireAuth, getFiveUserDelivered);

router.get(`/get-userCancelled`, requireAuth, getUserCancelled);

router.get(`/get-userRefunded`, requireAuth, getUserRefund);

router.get(`/get-userFailed`, requireAuth, getUserFailed);

router.get("/get-untracked-orders", requireAuth, getAllUntracked)

router.put(
  `/:orderId/status`, 
  requireAuth,
  requireAdmin,
  validateResource(updateOrderStatusSchema),
  updateDeliveryStatus
); 

router.put("/update-track-status/:orderId", requireAuth, updateTrackStatus)

router.delete("/delete-orders", requireAuth, requireAdmin, deleteAllOrders)

// router.get(`/:orderId`, requireAuth, requireAdmin , getSingleUserOrder);
router.get(`/:orderId`, optionalAuth, getSingleUserOrder);

router.post("/track-order/:orderId", trackSingleOrder)



export default router;

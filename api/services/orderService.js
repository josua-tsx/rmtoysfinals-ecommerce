import { logAuditTrail } from "../controllers/audit.controller.js";
import Product from "../models/product.model.js";
import Rider from "../models/rider.models.js";
import Stocks from "../models/stocks.model.js";
import User from "../models/user.models.js";
import { sendSMS } from "../utils/smsService.js";

// ✅ Status validation
export const validateStatus = (status) => {
  const validStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];
  return validStatuses.includes(status);
};

export const pendingRider = async (riderId) => {};

export const processingRider = async (riderId) => {};

export const updateRiderStatus = async (riderId, status) => {
  if (!riderId) throw new Error("Rider not found.");

  let riderUpdate = {};

  switch (status) {
    case "Delivered":
      riderUpdate = {
        $set: { riderStatus: "available" },
        $inc: { successDelivered: 1 },
      };
      break;

    case "Cancelled":
      riderUpdate = {
        $set: { riderStatus: "available" },
      };
      break;

    case "Pending":
    case "Processing":
      riderUpdate = {
        $set: { riderStatus: "available" },
      };
      break;

    case "Shipped":
    case "Out for Delivery":
      riderUpdate = {
        $set: { riderStatus: "unavailable" },
      };
      break;

    default:
      return; // do nothing if status is not handled
  }

  await Rider.findByIdAndUpdate(riderId, riderUpdate, {
    new: true,
    runValidators: true,
  });
};

// ✅ Assign Rider
export const assignRider = async (order, riderId) => {
  if (!riderId) throw new Error("Rider not found.");

  order.riderId = riderId;

  // 2. Add this orderId to rider.orders array
  await Rider.findByIdAndUpdate(
    riderId,
    { order: order._id, riderStatus: "unavailable" }, // avoids duplicates
    { new: true, runValidators: true }
  );
};

// ✅ Handle Delivered
export const handleDelivered = async (order) => {
  await Promise.all(
    order.orderItems.map((item) =>
      Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { sold: item.quantity },
          $addToSet: { userId: order.userId },
        },
        { new: true, runValidators: true }
      )
    )
  );

  // add credits to user
  if (order.userId) {
    await User.findByIdAndUpdate(order.userId, {
      $inc: { credits: order.totalPoints },
      ...(order.usedCredits > 0 && {
        $set: { creditLock: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      }),
    });
  }
};

// ✅ Handle Cancelled
export const handleCancelled = async (order, isGuestOrder) => {
  if (order.status === "Cancelled") return;

  // restore stocks
  for (const item of order.orderItems) {
    await Stocks.findOneAndUpdate(
      { product: item.productId },
      { $inc: { quantity: item.quantity } }
    );
  }

  // return credits for registered users
  if (!isGuestOrder && order.usedCredits) {
    await User.findByIdAndUpdate(order.userId, {
      $inc: { credits: order.usedCredits },
    });
  }
};

// ✅ Notifications + Logs
export const sendOrderNotification = async (
  status,
  order,
  isGuestOrder,
  userId
) => {
  const orderUserPhone = isGuestOrder
    ? order?.guestUser?.phone
    : order?.userId?.phoneNumber;

  const userEmail = order?.userId?.email;
  const smsMessages = {
    Delivered: `Your order ${order._id} has been delivered!`,
    Processing: `Your order ${order._id} is now processing.`,
    Shipped: `Your order ${order._id} has shipped!`,
    "Out for Delivery": `Your order ${order._id} is out for delivery.`,
    Cancelled: `Your order ${order._id} has been cancelled.`,
  };

  if (smsMessages[status]) {
    await sendSMS(orderUserPhone, smsMessages[status]);
  }

  if (!isGuestOrder && userId) {
    await logAuditTrail({
      action: `set_OrderStatus_${status}`,
      userId,
      targetId: order._id,
      targetType: "OrderStatus",
      details: { email: userEmail },
      role: order.userId?.role === "admin" ? "admin" : "validatorStaff",
    });
  }
};

import { handleMakeError } from "../middleware/handleError.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Stocks from "../models/stocks.model.js";

export const userPlaceOrder = async (req, res, next) => {
  const userId = req.user.id;
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    discount,
    subtotal,
    totalPrice,
    notes,
    gcashAdditionalDetails,
  } = req.body;

  try {
    let orderItemsWithQuantity = orderItems.map((item) => ({
      ...item,
      quantity: item.quantity || 1,
    }));

    if (!shippingAddress) {
      return next(
        handleMakeError(400, "You can't place an order without your address")
      );
    }

    if (orderItemsWithQuantity.length === 0) {
      return next(
        handleMakeError(400, "You can't place an order without products!")
      );
    }

    if (paymentMethod === "Gcash") {
    

      const newOrder = new Order({
        userId,
        orderItems: orderItemsWithQuantity,
        shippingAddress,
        paymentMethod,
        taxPrice,
        shippingPrice,
        discount,
        subtotal,
        totalPrice,
        notes,
        paymentStatus: "Pending",
        gcashAdditionalDetails,
      });

      await newOrder.save();

      for (const item of orderItemsWithQuantity) {
        await Stocks.findOneAndUpdate(
          { product: item.productId },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true, runValidators: true }
        );
      }

      const userCart = await Cart.findOne({ userId });
      userCart.items = [];
      await userCart.save();

      res.status(200).json({ message: "Order placed!", newOrder });
    }

    if (paymentMethod === "Cod") {
      const newOrder = new Order({
        userId,
        orderItems: orderItemsWithQuantity,
        shippingAddress,
        paymentMethod,
        taxPrice,
        shippingPrice,
        discount,
        subtotal,
        totalPrice,
        notes,
        paymentStatus: "Pending",
      });

      await newOrder.save();

      for (const item of orderItemsWithQuantity) {
        await Stocks.findOneAndUpdate(
          { product: item.productId },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true, runValidators: true }
        );
      }

      const userCart = await Cart.findOne({ userId });
      userCart.items = [];
      await userCart.save();

      res.status(200).json({ message: "Order placed!", newOrder });
    }
  } catch (error) {
    next(error);
  }
};

export const getUserOrder = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const userOrders = await Order.find({
      userId,
      status: { $in: ["Pending", "Processing", "Shipped", "Out for Delivery"] },
    });

    if (!userOrders || userOrders.length === 0) {
      return res
        .status(200)
        .json({ message: "No orders found for this user." });
    }

    res.status(200).json(userOrders);
  } catch (error) {
    next(error);
  }
};

export const getSingleUserOrder = async (req, res, next) => {
  // const userId = req.user.id;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId }).populate({
      path: "orderItems.productId",
      select: "productName price quantity category productImages",
      populate: {
        path: "category",
        select: "categoryName",
      },
    });

    if (!order) return next(handleMakeError(400, "Order not foud!"));

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const getAllOrder = async (req, res, next) => {
  try {
    // Fetch all orders
    const orders = await Order.find({
      status: {
        $in: ["Pending", "Processing", "Shipped", "Out for Delivery"],
      },
    })
      .populate({
        path: "userId",
        select: "fullName email",
      })
      .sort({ createdAt: -1 });

    // If no orders are found, return an empty array
    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    // If orders are found, return them
    res.status(200).json(orders);
  } catch (error) {
    next(error); // Pass the error to the next middleware for error handling
  }
};

export const getAllSuccess = async (req, res, next) => {
  try {
    // Fetch all orders
    const orders = await Order.find({
      status: ["Delivered"],
    })
      .populate({
        path: "userId",
        select: "fullName email phoneNumber",
        populate: {
          path: "address",
          select: "fullAddress",
        },
      })
      .sort({ createdAt: -1 });

    // If no orders are found, return an empty array
    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    // If orders are found, return them
    res.status(200).json(orders);
  } catch (error) {
    next(error); // Pass the error to the next middleware for error handling
  }
};

export const getAllFailed = async (req, res, next) => {
  try {
    // Fetch all orders
    const orders = await Order.find({
      paymentStatus: "Failed",
      status: "Cancelled",
    })
      .populate({
        path: "userId",
        select: "fullName email phoneNumber",
        populate: {
          path: "address",
          select: "fullAddress",
        },
      })
      .sort({ createdAt: -1 });

    // If no orders are found, return an empty array
    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    // If orders are found, return them
    res.status(200).json(orders);
  } catch (error) {
    next(error); // Pass the error to the next middleware for error handling
  }
};

export const getAllRefunded = async (req, res, next) => {
  try {
    // Fetch all orders
    const orders = await Order.find({
      $or: [{ paymentStatus: "Refunded" }, { status: "Refunded" }],
    })
      .populate({
        path: "userId",
        select: "fullName email phoneNumber",
        populate: {
          path: "address",
          select: "fullAddress",
        },
      })
      .sort({ createdAt: -1 });

    // If no orders are found, return an empty array
    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    // If orders are found, return them
    res.status(200).json(orders);
  } catch (error) {
    next(error); // Pass the error to the next middleware for error handling
  }
};

export const getAllCancelled = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: "Cancelled",
    })
      .populate({
        path: "userId",
        select: "fullName email phoneNumber",
        populate: {
          path: "address",
          select: "fullAddress",
        },
      })
      .sort({ createdAt: -1 });

    // If no orders are found, return an empty array
    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    // If orders are found, return them
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// export const updateDeliveryStatus = async (req, res, next) => {
//   const { orderId } = req.params;
//   const { status } = req.body;

//   try {
//     const validStatuses = [
//       "Pending",
//       "Processing",
//       "Shipped",
//       "Out for Delivery",
//       "Delivered",
//       "Cancelled",
//     ];

//     // Validate the status
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ message: "Invalid delivery status." });
//     }

//     // Find the order
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return next(handleMakeError(404, "Order not found!"));
//     }

//     // If the status is being updated to "Cancelled"
//     if (status === "Cancelled" && order.status !== "Cancelled") {
//       for (const item of order.orderItems) {
//         // ADDING BACK THE PRODUCT QUANTITY TO STOCK  QUANTITY
//         await Stocks.findOneAndUpdate(
//           { product: item.productId },
//           { $inc: { stockQuantity: item.quantity } },
//           { new: true, runValidators: true }
//         );
//       }
//     }

//     // Update the order status and payment status
//     const orderUpdate = {
//       status,
//       paymentStatus: status === "Delivered" ? "Paid" : "Pending",
//     };

//     const updatedOrder = await Order.findByIdAndUpdate(orderId, orderUpdate, {
//       new: true,
//       runValidators: true,
//     });

//     res.status(200).json({
//       order: updatedOrder,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const updateDeliveryStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid delivery status." });
    }

    const order = await Order.findById(orderId);

    if (!order) return next(handleMakeError(400, "No order found!"));

    if (status === "Cancelled" && order.status !== "Cancelled") {
      for (const item of order.orderItems) {
        // ADDING BACK THE PRODUCT QUANTITY TO STOCK  QUANTITY
        await Stocks.findOneAndUpdate(
          { product: item.productId },
          { $inc: { stockQuantity: item.quantity } },
          { new: true, runValidators: true }
        );
      }
    }

    const orderUpdate = {
      status,
      paymentStatus: status === "Delivered" ? "Paid" : "Pending",
    };

    // if (status === "Delivered") {
    //   orderUpdate.paymentStatus = "Paid";
    // } else {
    //   orderUpdate.paymentStatus = "Pending";
    // }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, orderUpdate, {
      new: true,
      runValidators: true,
    });
    if (!updatedOrder) return next(handleMakeError(400, "order not found!"));

    res.status(200).json({ message: "Delivery Status updated sucessfully" });
  } catch (error) {}
};

export const getUserDelivered = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const orders = await Order.find({
      userId,
      status: "Delivered",
    });

    if (!orders)
      return next(
        handleMakeError(400, "No Delivered or Cancelled orders found!")
      );

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getUserCancelled = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const orders = await Order.find({
      userId,
      status: "Cancelled",
    });

    if (!orders)
      return next(
        handleMakeError(400, "No Delivered or Cancelled orders found!")
      );

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;

  try {
    const validPaymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res
        .status(400)
        .json({ message: "Invalid payment status status." });
    }

    // Set order status to "Processing" if payment status is "Failed"
    const orderUpdate = {
      paymentStatus,
    };

    if (paymentStatus === "Paid") {
      orderUpdate.status = "Processing";
    }

    if (paymentStatus === "Pending") {
      orderUpdate.status = "Pending";
    }

    if (paymentStatus === "Failed") {
      orderUpdate.status = "Cancelled";
    }

    if (paymentStatus === "Refunded") {
      orderUpdate.status = "Cancelled";
    }

    const updatedPaymentStatus = await Order.findByIdAndUpdate(
      orderId,
      orderUpdate,
      { new: true, runValidators: true }
    );

    if (!updatedPaymentStatus)
      return next(handleMakeError(400, "status not found!"));

    res.status(200).json({ message: "Payment Status updated sucessfully" });
  } catch (error) {
    next(error);
  }
};

export const addReason = async (req, res, next) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        reason,
      },
      {
        new: true,
      }
    );

    if (!order) return next(handleMakeError(400, "Order not found!"));

    res.status(200).json({ message: "Succesfully Added a reason", order });
  } catch (error) {
    next(error);
  }
};

export const cancelSuccessTransact = async (req, res, next) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "Pending",
        paymentStatus: "Pending",
      },
      {
        new: true,
      }
    );

    if (!order) return next(handleMakeError(400, "No order found!"));

    res.status(200).json({ message: "cancelled success transact", order });
  } catch (error) {
    next(error);
  }
};

export const userCancelOrder = async (req, res, next) => {
  const { orderId } = req.body;
  const userId = req.user.id;

  try {
    const nonCancellableStatuses = ["Shipped", "Out for Delivery", "Delivered"];
    // WITH FINDONE YOU ARE CHECKING WHO IS THE USER WHO WILL UPDATE THE ORDER STATUS.
    // IF IT IS THE USER WHO ORDERED THE ORDER THEN HE CAN UPDATE IT, ELSE UNAUTHORIZED
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order)
      return next(
        handleMakeError(
          400,
          "Order not found or you are not authorized to cancel this order!"
        )
      );

    if (nonCancellableStatuses.includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Order cannot be canceled at this stage" });
    }

    if (order.paymentStatus === "Cancelled")
      return next(handleMakeError(400, "Order is already cancelled!"));

    // Update stock for each item in the order
    for (const item of order.orderItems) {
      await Stocks.findOneAndUpdate(
        { product: item.productId },
        { $inc: { stockQuantity: item.quantity } },
        { new: true, runValidators: true }
      );
    }

    order.status = "Cancelled";

    await order.save();

    res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    next(error);
  }
};

export const adminOrderRefund = async (req, res, next) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "Refunded",
        paymentStatus: "Refunded",
        reason: "Customer initiate the refund",
      },
      {
        new: true,
      }
    );

    if (!order) return next(handleMakeError(400, "No order found!"));

    res.status(200).json({ message: "Refunded", order });
  } catch (error) {
    next(error);
  }
};

export const getUserRefund = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const order = await Order.find({
      userId: userId,
      $or: [{ paymentStatus: "Refunded" }, { status: "Refunded" }],
    });

    if (order.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const getUserFailed = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const order = await Order.find({
      userId,
      paymentStatus: "Failed",
      status: "Cancelled",
    });

    if (order.length === 0) {
      return res.json([]);
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

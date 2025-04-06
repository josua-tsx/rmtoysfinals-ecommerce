import { handleMakeError } from "../middleware/handleError.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
import { sendEmail } from "../nodemailer/nodemailer.js";
import { logAuditTrail } from "./audit.controller.js";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    // IF STOCK OF SPECIFIC PRODUCT IN THE CARD IS 0 THEN YOU CAN NOT ORDER IT OR PROCEED TO CHECKOUT
    for (const item of orderItemsWithQuantity) {
      const productStock = await Stocks.findOne({ product: item.productId });

      if (!productStock || productStock.quantity < item.quantity) {
        // If stock is insufficient
        return next(
          handleMakeError(
            400,
            `Not enough stock for ${item.productId.productName}`
          )
        );
      }
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
          { $inc: { quantity: -item.quantity } },
          { new: true, runValidators: true }
        );
      }

      const userCart = await Cart.findOne({ userId });
      userCart.items = [];
      await userCart.save();

      await logAuditTrail({
        action: "user_add_order",
        userId,
        targetId: newOrder._id,
        targetType: "UserOrder",
        details: {
          description: "Ordered using cod",
        },
        role: "customer",
      });

      res.status(200).json({ message: "Order placed!", newOrder });
    }
  } catch (error) {
    next(error);
  }
};

export const placeOrderStripe = async (req, res, next) => {
  try {
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
    } = req.body;
  
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return next(handleMakeError(400, "Invalid or empty products array"));
    }

    const lineItems = orderItems.map((product) => {

      if (!product.productId) {
        return next(handleMakeError(400, "Missing productId in one of the order items"));
      }


      return {
        price_data: {
          currency: "php",
          product_data: {
            name: product.productName,
            images: [product.productImages],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: product.quantity,
      };
    });

    console.log(orderItems)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      metadata: {
        userId: req.user._id.toString(),
        orderItems: JSON.stringify(
          orderItems.map((item) => ({
            productId: item.productId._id,  // Only pass productId (not the whole object)
            productName: item.productId.productName,
            price: item.productId.price,
            quantity: item.quantity
          }))
        ), // Convert array to string
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod: JSON.stringify(paymentMethod),
        taxPrice: taxPrice.toString(),
        shippingPrice: shippingPrice.toString(),
        discount: discount.toString(),
        subtotal: subtotal.toString(),
        totalPrice: totalPrice.toString(),
        notes: notes || "",
      },
    });
    
    
    res.status(200).json({ url: session.url }); 
  } catch (error) {
    next(error);
  }
};


export const checkOutSuccess = async (req, res, next) => {
  try {
    const { sessionId } = req.body;


     // Check if order already exists for this session
     const existingOrder = await Order.findOne({ 'paymentInfo.sessionId': sessionId });
     if (existingOrder) {
       return res.status(200).json({ success: true, message: "Order already processed" });
     }
 

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }


    console.log("Session Metadata:", session.metadata);
    // Extract necessary data from session metadata
    const userId = session.metadata.userId; // Ensure userId is stored in metadata
      const orderItems = JSON.parse(session.metadata.orderItems).map((item) => {
        if (!item.productId) {
          return next(handleMakeError(400, "Missing productId in order items from metadata"));
        }
        return {
          productId: item.productId,
          quantity: item.quantity,
        };
      });
      
    
    const shippingAddress = JSON.parse(session.metadata.shippingAddress);
    const taxPrice = parseFloat(session.metadata.taxPrice);
    const shippingPrice = parseFloat(session.metadata.shippingPrice);
    const discount = parseFloat(session.metadata.discount);
    const subtotal = parseFloat(session.metadata.subtotal);
    const totalPrice = parseFloat(session.metadata.totalPrice);
    const notes = session.metadata.notes || "";

    // Create a new order
    const newOrder = new Order({
      userId,
      orderItems,
      shippingAddress,
      paymentMethod: "Online Payment",
      taxPrice,
      shippingPrice,
      discount,
      subtotal,
      totalPrice,
      notes,
      paymentStatus: "Paid",
      stripeSessionId: sessionId,
    });

    // Save the order in the database
    await newOrder.save();

    for (const item of orderItems) {
      await Stocks.findOneAndUpdate(
        { product: item.productId },
        { $inc: { quantity: -item.quantity } },
        { new: true, runValidators: true }
      );
    }

    const userCart = await Cart.findOne({ userId });
    userCart.items = [];
    await userCart.save();

    res.status(200).json({ success: true, message: "Order placed successfully!" });

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
    }).sort({ createdAt: -1 });

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
    const order = await Order.findOne({ _id: orderId })
      .populate({
        path: "orderItems.productId",
        select: "productName price quantity category productImages",
        populate: {
          path: "category",
          select: "categoryName",
        },
      })
      .populate({
        path: "userId",
        select: "email phoneNumber fullName",
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

export const updateDeliveryStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

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

    const order = await Order.findById(orderId).populate("userId");

    const userEmail = order?.userId.email;

    if (!order) return next(handleMakeError(400, "No order found!"));

    const orderUserEmail = order.userId.email;

    if (status === "Cancelled" && order.status !== "Cancelled") {
      for (const item of order.orderItems) {
        // ADDING BACK THE PRODUCT QUANTITY TO STOCK  QUANTITY
        await Stocks.findOneAndUpdate(
          { product: item.productId },
          { $inc: { quantity: item.quantity } },
          { new: true, runValidators: true }
        );
      }
    }

    const orderUpdate = {
      status,
      paymentStatus: status === "Delivered" ? "Paid" : "Pending",
    };

    const updatedOrder = await Order.findByIdAndUpdate(orderId, orderUpdate, {
      new: true,
      runValidators: true,
    });
    if (!updatedOrder) return next(handleMakeError(400, "order not found!"));

    if (updatedOrder.status === "Delivered") {
      //////////////////////////////////////
      // sending a email message to a user using nodemailer!!
      const deliveredSubject = `Your Order ${updatedOrder._id} Has been Delivered!`;

      const deliveredMessage = `We're happy to let you know that your order has been successfully delivered! 
      We hope you enjoy your purchase. If you have any questions or need assistance, 
      feel free to contact our support team. Thank you for shopping with us!`;

      try {
        await sendEmail(userEmail, deliveredSubject, deliveredMessage);
        console.log(`Delivery email sent to ${orderUserEmail}`);
      } catch (emailError) {
        console.error("Error sending delivery email:", emailError);
      }

      ///////////////

      for (const item of updatedOrder.orderItems) {
        const productId = item.productId; // Get the productId
        const quantitySold = item.quantity; // Get the quantity sold

        // Update the sold quantity in the Product collection
        await Product.findByIdAndUpdate(
          productId,
          { $inc: { sold: quantitySold } }, // Increment the soldQuantity by the quantity sold
          { new: true, runValidators: true }
        );
      }

      await Notification.deleteMany({});

      await logAuditTrail({
        action: "set_OrderStatus_delivered",
        userId,
        targetId: updatedOrder._id,
        targetType: "OrderStatus",
        details: {
          email: orderUserEmail,
        },
        role: "admin",
      });
    }

    // Handle different status updates
    switch (updatedOrder.status) {
      case "Delivered":
        await sendEmail(
          userEmail,
          `Your Order ${updatedOrder._id} Has been Delivered!`,
          "We're happy to let you know that your order has been successfully delivered! Enjoy your purchase."
        );
        await Promise.all(
          updatedOrder.orderItems.map((item) =>
            Product.findByIdAndUpdate(
              item.productId,
              { $inc: { sold: item.quantity } },
              { new: true, runValidators: true }
            )
          )
        );
        break;

      case "Processing":
        await sendEmail(
          userEmail,
          `Your ${updatedOrder._id} is on Processing.`,
          "Your order is being processed. We will notify you once it is shipped."
        );
        break;

      case "Shipped":
        await sendEmail(
          userEmail,
          `Your ${updatedOrder._id} is Shipped!`,
          "Your order is now on its way to you!"
        );
        break;

      case "Out for Delivery":
        await sendEmail(
          userEmail,
          `Your order ${updatedOrder._id} is Out for Delivery!`,
          "Your order is on the way. Expect delivery soon!"
        );
        break;

      case "Cancelled":
        await sendEmail(
          userEmail,
          `Your order ${updatedOrder._id} has been Cancelled`,
          "Unfortunately, your order has been canceled. Please contact support for further assistance."
        );
        break;
    }

    res.status(200).json({ message: "Delivery Status updated sucessfully" });
  } catch (error) {}
};

export const getUserDelivered = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const orders = await Order.find({
      userId,
      status: "Delivered",
    }).sort({ createdAt: -1 });

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
    }).sort({ createdAt: -1 });

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
  const userId = req.user.id;

  try {
    const validPaymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res
        .status(400)
        .json({ message: "Invalid payment status status." });
    }

    const order = await Order.findById(orderId).populate("userId");

    if (!order) return next(handleMakeError(400, "No order found!"));

    const paymentStatusOrderEmail = order.userId?.email;

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

    if (updatedPaymentStatus.paymentStatus === "Paid") {
      await logAuditTrail({
        action: "set_PaymentStatus_paid",
        userId,
        targetId: updatedPaymentStatus._id,
        targetType: "PaymentStatus",
        details: {
          email: paymentStatusOrderEmail,
        },
        role: "admin",
      });
    }

    if (updatedPaymentStatus.paymentStatus === "Failed") {
      const failedSubject = `Your Order Gcash method ${updatedPaymentStatus._id} has been failed!`;
      const failedMessage = `We were unable to process your payment for the order due to an issue with the transaction. 
      Please check your order history failed to see the reason. if you need assistance or would like more information, feel free to contact our support team.`;

      await sendEmail(paymentStatusOrderEmail, failedSubject, failedMessage);

      // Update stock for each item in the order
      for (const item of order.orderItems) {
        await Stocks.findOneAndUpdate(
          { product: item.productId },
          { $inc: { quantity: item.quantity } },
          { new: true, runValidators: true }
        );
      }

      await logAuditTrail({
        action: "set_PaymentStatus_Failed",
        userId,
        targetId: updatedPaymentStatus._id,
        targetType: "PaymentStatus",
        details: {
          email: paymentStatusOrderEmail,
        },
        role: "admin",
      });
    }

    if (updatedPaymentStatus.paymentStatus === "Refunded") {
      const failedSubject = `Your Order Gcash method  ${updatedPaymentStatus._id} has been refunded!`;
      const failedMessage = `We were unable to process your payment for the order due to an issue with the transaction. 
      Please check your order history refunded to see the reason. if you need assistance or would like more information, feel free to contact our support team.`;

      await sendEmail(paymentStatusOrderEmail, failedSubject, failedMessage);

      // Update stock for each item in the order
      for (const item of order.orderItems) {
        await Stocks.findOneAndUpdate(
          { product: item.productId },
          { $inc: { quantity: item.quantity } },
          { new: true, runValidators: true }
        );
      }

      await logAuditTrail({
        action: "set_PaymentStatus_Refunded",
        userId,
        targetId: updatedPaymentStatus._id,
        targetType: "PaymentStatus",
        details: {
          email: paymentStatusOrderEmail,
        },
        role: "admin",
      });
    }

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
  const userId = req.user.id;

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
    ).populate("userId");

    if (!order) return next(handleMakeError(400, "No order found!"));

    const orderEmail = order.userId?.email;

    for (const item of order.orderItems) {
      const productId = item.productId; // Get the productId
      const quantitySold = item.quantity; // Get the quantity sold

      // Update the sold quantity in the Product collection
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { sold: -quantitySold } }, // Increment the soldQuantity by the quantity sold
        { new: true, runValidators: true }
      );
    }

    await logAuditTrail({
      action: "cancelled_Order_Transact",
      userId,
      targetId: order._id,
      targetType: "CancelOrder_Transact",
      details: {
        email: orderEmail,
      },
      role: "admin",
    });

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
        { $inc: { quantity: item.quantity } },
        { new: true, runValidators: true }
      );
    }

    order.status = "Cancelled";

    await order.save();

    await logAuditTrail({
      action: "user_cancelled_order",
      userId,
      targetId: order._id,
      targetType: "Order",
      details: {
        description: "User Cancelled an order!",
      },
      role: "customer",
    });

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

    for (const item of order.orderItems) {
      const productId = item.productId; // Get the productId
      const quantitySold = item.quantity; // Get the quantity sold

      // Update the sold quantity in the Product collection
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { sold: -quantitySold } }, // DECREMENT the soldQuantity by the quantity sold
        { new: true, runValidators: true }
      );
    }

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

// MONTHLY SALES
export const getMonthlySales = async (req, res, next) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const sales = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          paymentStatus: "Paid",
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $project: {
          month: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
              timezone: "UTC",
            },
          },
          // Use totalPrice directly since it's already in the schema
          totalSales: "$totalPrice",
          orderCount: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          totalSales: { $sum: "$totalSales" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$totalSales" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalSales: { $round: ["$totalSales", 2] },
          orderCount: 1,
          avgOrderValue: { $round: ["$avgOrderValue", 2] },
        },
      },
    ]);

    // If no sales for the year, return empty array with 12 months
    const allMonths = [
      "2024-01",
      "2024-02",
      "2024-03",
      "2024-04",
      "2024-05",
      "2024-06",
      "2024-07",
      "2024-08",
      "2024-09",
      "2024-10",
      "2024-11",
      "2024-12",
    ];

    const completeMonthlyData = allMonths.map((month) => {
      const matchingMonth = sales.find((s) => s.month === month);
      return (
        matchingMonth || {
          month,
          totalSales: 0,
          orderCount: 0,
          avgOrderValue: 0,
        }
      );
    });

    res.status(200).json(completeMonthlyData);
  } catch (error) {
    next(error);
  }
};

export const getLatestSuccessOrder = async (req, res, next) => {
  try {
    // Fetch all orders
    const orders = await Order.findOne({
      status: ["Delivered"],
    })
      .populate({
        path: "orderItems.productId",
        select: "productImages price paymentMethod productName",
      })
      .sort({ createdAt: -1 });

    // if (orders.length === 0) {
    //   return res.status(200).json([]);
    // }

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getLatestFailedOrder = async (req, res, next) => {
  try {
    // Fetch all orders
    const orders = await Order.findOne({
      paymentStatus: "Failed",
      status: "Cancelled",
    })
      .populate({
        path: "orderItems.productId",
        select: "productImages price paymentMethod productName",
      })
      .sort({ createdAt: -1 });

    // If no orders are found, return an empty array
    // if (orders.length === 0) {
    //   return res.status(200).json([]);
    // }

    // If orders are found, return them
    res.status(200).json(orders);
  } catch (error) {
    next(error); // Pass the error to the next middleware for error handling
  }
};

export const getLatestRefundedOrder = async (req, res, next) => {
  try {
    // Fetch all orders
    const orders = await Order.findOne({
      $or: [{ paymentStatus: "Refunded" }, { status: "Refunded" }],
    })
      .populate({
        path: "orderItems.productId",
        select: "productImages price paymentMethod productName",
      })
      .sort({ createdAt: -1 });

    // If no orders are found, return an empty array
    // if (orders.length === 0) {
    //   return res.status(200).json([]);
    // }

    // If orders are found, return them
    res.status(200).json(orders);
  } catch (error) {
    next(error); // Pass the error to the next middleware for error handling
  }
};

export const getLatestCancelledOrder = async (req, res, next) => {
  try {
    const orders = await Order.findOne({
      status: "Cancelled",
    })
      .populate({
        path: "orderItems.productId",
        select: "productImages price paymentMethod productName",
      })
      .sort({ createdAt: -1 });

    // If orders are found, return them
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

import mongoose from "mongoose";
import { handleMakeError } from "../middleware/handleError.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
import User from "../models/user.models.js";
import { sendSMS } from "../utils/smsService.js";
import { logAuditTrail } from "./audit.controller.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // MUST be initialized

export const userPlaceOrder = async (req, res, next) => {
  const userId = req.user.id;
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    shippingPrice,
    discount,
    subtotal,
    totalPrice,
    notes,
    totalPoints,
    usedCredits,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate inputs
    if (!shippingAddress) {
      await session.abortTransaction();
      return next(handleMakeError(400, "Shipping address is required"));
    }

    if (orderItems.length === 0) {
      await session.abortTransaction();
      return next(handleMakeError(400, "Order must contain products"));
    }

    // Process order items
    let orderItemsWithQuantity = orderItems.map((item) => ({
      ...item,
      quantity: item.quantity || 1,
    }));

    let totalItemsOrdered = orderItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    // IF STOCK OF SPECIFIC PRODUCT IN THE CARD IS 0 THEN YOU CAN NOT ORDER IT OR PROCEED TO CHECKOUT
    for (const item of orderItemsWithQuantity) {
      if (item.quantity <= 0) {
        await session.abortTransaction();
        return next(
          handleMakeError(400, "Item quantity must be greater than zero")
        );
      }

      if (item.quantity > 5) {
        await session.abortTransaction();
        return next(
          handleMakeError(
            400,
            "You can only order up to 5 items per product at a time"
          )
        );
      }

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

    // Check credit availability if using credits
    if (usedCredits > 0) {
      const user = await User.findById(userId).session(session);

      // if user select usedCredits, this if verify if credit lock is already done then proceed to set credit lock to null to let the user use their cretis again
      // If user selects usedCredits, verify if credit lock is already done
      if (user.creditLock) {
        const now = new Date();
        const lockExpiry = new Date(user.creditLock);

        console.log(
          `Current: ${now.toISOString()} | Lock: ${lockExpiry.toISOString()}`
        );

        if (lockExpiry <= now) {
          await User.findByIdAndUpdate(
            userId,
            { $set: { creditLock: null } },
            { session }
          );
        } else {
          const expiryDate = lockExpiry.toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return next(
            handleMakeError(400, `⏳ Credits locked until ${expiryDate}`)
          );
        }
      }
    }

    // Create order
    const newOrder = new Order({
      userId,
      orderItems: orderItemsWithQuantity,
      shippingAddress,
      paymentMethod,
      shippingPrice,
      discount,
      subtotal,
      totalPrice,
      notes,
      paymentStatus: "Pending",
      totalPoints,
      usedCredits,
      totalItemsOrdered,
      stripeSessionId: `cod-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    });

    await newOrder.save({ session });

    // Update user credits and set lock if points are earned
    const updates = {
      $inc: { credits: -usedCredits },
    };

    await User.findByIdAndUpdate(userId, updates, { new: true, session });

    // Update stock
    for (const item of orderItemsWithQuantity) {
      await Stocks.findOneAndUpdate(
        { product: item.productId },
        { $inc: { quantity: -item.quantity } },
        { new: true, runValidators: true, session }
      );
    }

    // Clear cart
    const userCart = await Cart.findOne({ userId }).session(session);
    userCart.items = [];
    await userCart.save({ session });

    // Audit trail
    await logAuditTrail({
      action: "user_add_order",
      userId,
      targetId: newOrder._id,
      targetType: "UserOrder",
      details: {
        description: `Ordered using ${paymentMethod}`,
        creditsUsed: usedCredits,
        pointsEarned: totalPoints,
      },
      role: "customer",
    });

    await session.commitTransaction();

    return res.status(200).json({
      message: "Order placed successfully!",
      order: newOrder,
      creditsUsed: usedCredits,
      pointsEarned: totalPoints,
      creditsLockedUntil:
        totalPoints > 0 ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const guestOrderStripe = async (req, res, next) => {
  const session = await mongoose.startSession();

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

    try {
      await session.startTransaction();

      // IF STOCK OF SPECIFIC PRODUCT IN THE CARD IS 0 THEN YOU CAN NOT ORDER IT OR PROCEED TO CHECKOUT
      for (const item of orderItems) {
        if (!item.productId) {
          await session.abortTransaction();
          return next(
            handleMakeError(400, "Missing product ID in order items")
          );
        }

        if (item.quantity <= 0) {
          await session.abortTransaction();
          return next(
            handleMakeError(400, "Quantity must be greater than zero")
          );
        }

        if (item.quantity > 5) {
          await session.abortTransaction();
          return next(
            handleMakeError(
              400,
              "You can only order up to 5 items per product at a time."
            )
          );
        }

        const productStock = await Stocks.findOne({
          product: item.productId,
        }).session(session);

        if (!productStock) {
          await session.abortTransaction();
          return next(
            handleMakeError(400, `Product ${item.productId} not found`)
          );
        }

        if (productStock.quantity < item.quantity) {
          await session.abortTransaction();
          return next(
            handleMakeError(400, `Insufficient stock for ${item.productName}`)
          );
        }
      }

      const lineItems = orderItems.map((product) => {
        if (!product.productId) {
          return next(
            handleMakeError(400, "Missing productId in one of the order items")
          );
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

      // Create a temporary order ID for guests
      const tempOrderId = `guest-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
        metadata: {
          userId: tempOrderId,
          orderItems: JSON.stringify(
            orderItems.map((item) => ({
              productId: item.productId._id,
              productName: item.productId.productName,
              price: item.productId.price,
              quantity: item.quantity,
            }))
          ),
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

      await session.commitTransaction();
      res.status(200).json({ url: stripeSession.url });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  } catch (error) {
    next(error);
  }
};

export const placeOrderStripe = async (req, res, next) => {
  const userId = req.user.id;
  const session = await mongoose.startSession();

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
      totalPoints,
      usedCredits,
    } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return next(handleMakeError(400, "Invalid or empty products array"));
    }

    try {
      await session.startTransaction();

      // IF STOCK OF SPECIFIC PRODUCT IN THE CARD IS 0 THEN YOU CAN NOT ORDER IT OR PROCEED TO CHECKOUT
      for (const item of orderItems) {
        if (!item.productId) {
          await session.abortTransaction();
          return next(
            handleMakeError(400, "Missing product ID in order items")
          );
        }

        if (item.quantity <= 0) {
          await session.abortTransaction();
          return next(
            handleMakeError(400, "Quantity must be greater than zero")
          );
        }

        if (item.quantity > 5) {
          await session.abortTransaction();
          return next(
            handleMakeError(
              400,
              "You can only order up to 5 items per product at a time."
            )
          );
        }

        const productStock = await Stocks.findOne({
          product: item.productId,
        }).session(session);

        if (!productStock) {
          await session.abortTransaction();
          return next(
            handleMakeError(400, `Product ${item.productId} not found`)
          );
        }

        if (productStock.quantity < item.quantity) {
          await session.abortTransaction();
          return next(
            handleMakeError(400, `Insufficient stock for ${item.productName}`)
          );
        }
      }

      // Validate credits
      if (usedCredits > 0) {
        const user = await User.findById(userId).session(session);

        if (user.creditLock) {
          const now = new Date();
          const lockExpiry = new Date(user.creditLock);

          if (lockExpiry > now) {
            const expiryDate = lockExpiry.toLocaleString("en-US", {
              timeZone: "Asia/Manila",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            await session.abortTransaction();
            return next(
              handleMakeError(400, `Credits locked until ${expiryDate}`)
            );
          } else {
            await User.findByIdAndUpdate(
              req.user.id,
              { $set: { creditLock: null } },
              { session }
            );
          }
        }
      }

      const lineItems = orderItems.map((product) => {
        if (!product.productId) {
          return next(
            handleMakeError(400, "Missing productId in one of the order items")
          );
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

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
        metadata: {
          userId: req.user._id.toString(),
          orderItems: JSON.stringify(
            orderItems.map((item) => ({
              productId: item.productId._id,
              productName: item.productId.productName,
              price: item.productId.price,
              quantity: item.quantity,
            }))
          ),
          shippingAddress: JSON.stringify(shippingAddress),
          paymentMethod: JSON.stringify(paymentMethod),
          taxPrice: taxPrice.toString(),
          shippingPrice: shippingPrice.toString(),
          discount: discount.toString(),
          subtotal: subtotal.toString(),
          totalPrice: totalPrice.toString(),
          notes: notes || "",
          totalPoints: totalPoints.toString(),
          usedCredits: usedCredits.toString(),
        },
      });

      await session.commitTransaction();
      res.status(200).json({ url: stripeSession.url });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  } catch (error) {
    next(error);
  }
};

export const checkOutSuccess = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    // 1. Check if order already exists for this session (prevent duplicates)
    if (!sessionId) {
      return next(handleMakeError(400, "Invalid session ID"));
    }

    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Order already processed",
        order: existingOrder,
      });
    }

    // 2. Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid") {
      return next(
        handleMakeError(400, "Payment not completed or session invalid")
      );
    }

    // 3. Parse metadata safely
    if (!session.metadata) {
      return next(handleMakeError(400, "Missing metadata in Stripe session"));
    }

    const {
      userId,
      orderItems: orderItemsStr,
      shippingAddress: shippingAddressStr,
      taxPrice,
      shippingPrice,
      discount,
      subtotal,
      totalPrice,
      notes = "",
      totalPoints,
      usedCredits,
    } = session.metadata;

    if (!userId || !orderItemsStr) {
      return next(handleMakeError(400, "Missing critical metadata fields"));
    }

    let orderItems, shippingAddress;
    try {
      orderItems = JSON.parse(orderItemsStr).map((item) => ({
        productId: item.productId,
        quantity: item.quantity || 1,
      }));
      shippingAddress = JSON.parse(shippingAddressStr);
    } catch (err) {
      return next(handleMakeError(400, "Invalid metadata format"));
    }

    // 4. Create and save the order
    const newOrder = new Order({
      userId,
      orderItems,
      shippingAddress,
      paymentMethod: "Online Payment",
      taxPrice: parseFloat(taxPrice) || 0,
      shippingPrice: parseFloat(shippingPrice) || 0,
      discount: parseFloat(discount) || 0,
      subtotal: parseFloat(subtotal) || 0,
      totalPrice: parseFloat(totalPrice) || 0,
      notes,
      totalPoints,
      usedCredits,
      paymentStatus: "Paid",
      stripeSessionId: sessionId, // This must be unique
    });

    await newOrder.save();

    await User.findByIdAndUpdate(
      newOrder.userId,
      {
        $inc: { credits: -usedCredits },
      },
      { new: true }
    );

    // 5. Update stock and clear cart
    for (const item of orderItems) {
      await Stocks.findOneAndUpdate(
        { product: item.productId },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
    }

    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const placeOrderGcashQR = async (req, res, next) => {
  const userId = req.user.id;
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    shippingPrice,
    discount,
    subtotal,
    totalPrice,
    notes,
    totalPoints,
    usedCredits,
    gcashQRmethod,
  } = req.body;

  try {
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return next(handleMakeError(400, "Invalid or empty products array"));
    }

    if (orderItems.length === 0) {
      return next(
        handleMakeError(400, "You can't place an order without products!")
      );
    }

    // IF STOCK OF SPECIFIC PRODUCT IN THE CARD IS 0 THEN YOU CAN NOT ORDER IT OR PROCEED TO CHECKOUT
    for (const item of orderItems) {
      if (item.quantity <= 0) {
        await session.abortTransaction();
        return next(
          handleMakeError(400, "Item quantity must be greater than zero")
        );
      }

      if (item.quantity > 5) {
        await session.abortTransaction();
        return next(
          handleMakeError(
            400,
            "You can only order up to 5 items per product at a time"
          )
        );
      }

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

    // Validate GCash QR payment details if payment method is GcashQR
    if (paymentMethod === "GcashQR") {
      if (
        !gcashQRmethod ||
        !gcashQRmethod.gcashPhoneNumber ||
        !gcashQRmethod.proofOfPaymentImage ||
        !gcashQRmethod.gcashName
      ) {
        return next(
          handleMakeError(
            400,
            "GCash QR payment requires phone number, proof of payment image, and GCash name"
          )
        );
      }
    }

    // Check credit availability if using credits
    if (usedCredits > 0) {
      const user = await User.findById(userId).session(session);

      // if user select usedCredits, this if verify if credit lock is already done then proceed to set credit lock to null to let the user use their cretis again
      // If user selects usedCredits, verify if credit lock is already done
      if (user.creditLock) {
        const now = new Date();
        const lockExpiry = new Date(user.creditLock);

        console.log(
          `Current: ${now.toISOString()} | Lock: ${lockExpiry.toISOString()}`
        );

        if (lockExpiry <= now) {
          await User.findByIdAndUpdate(
            userId,
            { $set: { creditLock: null } },
            { session }
          );
        } else {
          const expiryDate = lockExpiry.toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return next(
            handleMakeError(400, `⏳ Credits locked until ${expiryDate}`)
          );
        }
      }
    }

    const orderData = {
      userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingPrice,
      discount,
      subtotal,
      totalPrice,
      notes,
      totalPoints,
      usedCredits,
      paymentStatus: "Pending",
      stripeSessionId: `gcashQR-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };

    // Add GCash QR details if payment method is GcashQR
    if (paymentMethod === "GcashQR") {
      orderData.gcashQRmethod = {
        phoneNumber: gcashQRmethod.gcashPhoneNumber,
        proofOfPaymentImage: gcashQRmethod.proofOfPaymentImage,
        gcashName: gcashQRmethod.gcashName,
      };
    }

    const newOrder = new Order(orderData);
    await newOrder.save();

    await User.findByIdAndUpdate(
      newOrder.userId,
      {
        $inc: { credits: -usedCredits },
      },
      { new: true }
    );

    for (const item of orderItems) {
      await Stocks.findOneAndUpdate(
        { product: item.productId },
        { $inc: { quantity: -item.quantity } },
        { new: true }
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
        description: "Ordered using GcashQR",
      },
      role: "customer",
    });

    res.status(201).json(newOrder);
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
        path: "orderItems.productId",
        select: "price preVatPrice",
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
        path: "orderItems.productId",
        select: "price preVatPrice",
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
    const orderUserPhoneNumber = order?.userId.phoneNumber;

    if (!order) return next(handleMakeError(400, "No order found!"));

    if (status === "Cancelled" && order.status !== "Cancelled") {
      for (const item of order.orderItems) {
        // ADDING BACK THE PRODUCT QUANTITY TO STOCK  QUANTITY
        await Stocks.findOneAndUpdate(
          { product: item.productId },
          { $inc: { quantity: item.quantity } },
          { new: true, runValidators: true }
        );
      }
      if (order.usedCredits) {
        await User.findByIdAndUpdate(order.userId, {
          $inc: { credits: order.usedCredits }, // Return credits to the user
        });
      }
    }

    const isUserAdminOrValida = await User.findById(userId);

    const orderUpdate = {
      status,
      paymentStatus: status === "Delivered" ? "Paid" : "Pending",
    };

    const updatedOrder = await Order.findByIdAndUpdate(orderId, orderUpdate, {
      new: true,
      runValidators: true,
    });
    if (!updatedOrder) return next(handleMakeError(400, "order not found!"));

    // Handle different status updates
    switch (updatedOrder.status) {
      case "Delivered":
        try {
          await sendSMS(
            orderUserPhoneNumber,
            `Your Order ${updatedOrder._id} Has been Delivered!
                          "We're happy to let you know that your order has been successfully delivered! Enjoy your purchase.
                          From: RM TOYS"
          `
          );

          // Update products and user credits in parallel
          await Promise.all([
            ...updatedOrder.orderItems.map((item) =>
              Product.findByIdAndUpdate(
                item.productId,
                { $inc: { sold: item.quantity } },
                { new: true, runValidators: true }
              )
            ),

            ...updatedOrder.orderItems.map((item) =>
              Product.findByIdAndUpdate(
                item.productId,
                { $addToSet: { userId: updatedOrder.userId } }, // Using $addToSet to avoid duplicates
                { new: true, runValidators: true }
              )
            ),

            User.findByIdAndUpdate(updatedOrder.userId, {
              $inc: { credits: updatedOrder.totalPoints },
            }),

            ...(updatedOrder.usedCredits > 0
              ? [
                  User.findByIdAndUpdate(updatedOrder.userId, {
                    $set: {
                      creditLock: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    },
                  }),
                ]
              : []),
          ]);

          // Audit trail

          if (isUserAdminOrValida.role === "admin") {
            await logAuditTrail({
              action: "set_OrderStatus_delivered",
              userId,
              targetId: updatedOrder._id,
              targetType: "OrderStatus",
              details: { email: userEmail }, // Consistent variable usage
              role: "admin",
            });
          } else {
            await logAuditTrail({
              action: "set_OrderStatus_delivered",
              userId,
              targetId: updatedOrder._id,
              targetType: "OrderStatus",
              details: { email: userEmail }, // Consistent variable usage
              role: "validatorStaff",
            });
          }
        } catch (error) {
          // Handle errors appropriately
          console.error("Delivery processing failed:", error);
          throw error; // Or handle differently
        }
        break;

      case "Processing":
        await sendSMS(
          orderUserPhoneNumber,
          `Your ${updatedOrder._id} is on Processing.`,
          "Your order is being processed. We will notify you once it is shipped.",
          "From: RM TOYS"
        );

        if (isUserAdminOrValida.role === "admin") {
          await logAuditTrail({
            action: "set_OrderStatus_Processing",
            userId,
            targetId: updatedOrder._id,
            targetType: "OrderStatus",
            details: { email: userEmail }, // Consistent variable usage
            role: "admin",
          });
        } else {
          await logAuditTrail({
            action: "set_OrderStatus_Processing",
            userId,
            targetId: updatedOrder._id,
            targetType: "OrderStatus",
            details: { email: userEmail }, // Consistent variable usage
            role: "validatorStaff",
          });
        }
        break;

      case "Shipped":
        await sendSMS(
          orderUserPhoneNumber,
          `Your ${updatedOrder._id} is Shipped!`,
          "Your order is now on its way to you!",
          "From: RM TOYS"
        );

        if (isUserAdminOrValida.role === "admin") {
          await logAuditTrail({
            action: "set_OrderStatus_Shipped",
            userId,
            targetId: updatedOrder._id,
            targetType: "OrderStatus",
            details: { email: userEmail }, // Consistent variable usage
            role: "admin",
          });
        } else {
          await logAuditTrail({
            action: "set_OrderStatus_Shipped",
            userId,
            targetId: updatedOrder._id,
            targetType: "OrderStatus",
            details: { email: userEmail }, // Consistent variable usage
            role: "validatorStaff",
          });
        }
        break;

      case "Out for Delivery":
        await sendSMS(
          orderUserPhoneNumber,
          `Your order ${updatedOrder._id} is Out for Delivery!`,
          "Your order is on the way. Expect delivery soon!",
          "From: RM TOYS"
        );

        if (isUserAdminOrValida.role === "admin") {
          await logAuditTrail({
            action: "set_OrderStatus_OutforDelivery",
            userId,
            targetId: updatedOrder._id,
            targetType: "OrderStatus",
            details: { email: userEmail }, // Consistent variable usage
            role: "admin",
          });
        } else {
          await logAuditTrail({
            action: "set_OrderStatus_OutforDelivery",
            userId,
            targetId: updatedOrder._id,
            targetType: "OrderStatus",
            details: { email: userEmail }, // Consistent variable usage
            role: "validatorStaff",
          });
        }
        break;

      case "Cancelled":
        await sendSMS(
          orderUserPhoneNumber,
          `Your order ${updatedOrder._id} has been Cancelled`,
          "Unfortunately, your order has been canceled. Please contact support for further assistance.",
          "From: RM TOYS"
        );

        if (isUserAdminOrValida.role === "admin") {
          await logAuditTrail({
            action: "set_OrderStatus_Cancelled",
            userId,
            targetId: updatedOrder._id,
            targetType: "OrderStatus",
            details: { email: userEmail }, // Consistent variable usage
            role: "admin",
          });
        } else {
          await logAuditTrail({
            action: "set_OrderStatus_Cancelled",
            userId,
            targetId: updatedOrder._id,
            targetType: "OrderStatus",
            details: { email: userEmail }, // Consistent variable usage
            role: "validatorStaff",
          });
        }

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

    const paymentStatusOrderPhoneNumber = order.userId?.phoneNumber;
    const paymentStatusOrderEmail = order.userId?.email;

    const isUserAdminOrValida = await User.findById(userId);

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
      orderUpdate.status = "Refunded";
    }

    const updatedPaymentStatus = await Order.findByIdAndUpdate(
      orderId,
      orderUpdate,
      { new: true, runValidators: true }
    );

    if (!updatedPaymentStatus)
      return next(handleMakeError(400, "status not found!"));

    if (updatedPaymentStatus.paymentStatus === "Paid") {
      if (isUserAdminOrValida.role === "admin") {
        await logAuditTrail({
          action: "set_PaymentStatus_Paid",
          userId,
          targetId: updatedPaymentStatus._id,
          targetType: "PaymentStatus",
          details: {
            email: paymentStatusOrderEmail,
          },
          role: "admin",
        });
      } else {
        await logAuditTrail({
          action: "set_PaymentStatus_Paid",
          userId,
          targetId: updatedPaymentStatus._id,
          targetType: "PaymentStatus",
          details: {
            email: paymentStatusOrderEmail,
          },
          role: "validatorStaff",
        });
      }
    }

    if (updatedPaymentStatus.paymentStatus === "Failed") {
      const failedSubject = `Your Order Gcash method ${updatedPaymentStatus._id} has been failed!`;
      const failedMessage = `We were unable to process your payment for the order due to an issue with the transaction. 
      Please check your order history failed to see the reason. if you need assistance or would like more information, feel free to contact our support team.`;

      await sendSMS(
        paymentStatusOrderPhoneNumber,
        failedSubject,
        failedMessage
      );

      // Update stock for each item in the order
      for (const item of order.orderItems) {
        await Stocks.findOneAndUpdate(
          { product: item.productId },
          { $inc: { quantity: item.quantity } },
          { new: true, runValidators: true }
        );
      }

      if (isUserAdminOrValida.role === "admin") {
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
      } else {
        await logAuditTrail({
          action: "set_PaymentStatus_Failed",
          userId,
          targetId: updatedPaymentStatus._id,
          targetType: "PaymentStatus",
          details: {
            email: paymentStatusOrderEmail,
          },
          role: "validatorStaff",
        });
      }
    }

    if (updatedPaymentStatus.paymentStatus === "Refunded") {
      const failedSubject = `Your Order Gcash method  ${updatedPaymentStatus._id} has been refunded!`;
      const failedMessage = `We were unable to process your payment for the order due to an issue with the transaction. 
      Please check your order history refunded to see the reason. if you need assistance or would like more information, feel free to contact our support team.`;

      await sendSMS(
        paymentStatusOrderPhoneNumber,
        failedSubject,
        failedMessage
      );

      // Update stock for each item in the order
      for (const item of order.orderItems) {
        await Stocks.findOneAndUpdate(
          { product: item.productId },
          { $inc: { quantity: item.quantity } },
          { new: true, runValidators: true }
        );
      }

      if (isUserAdminOrValida.role === "admin") {
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
      } else {
        await logAuditTrail({
          action: "set_PaymentStatus_Refunded",
          userId,
          targetId: updatedPaymentStatus._id,
          targetType: "PaymentStatus",
          details: {
            email: paymentStatusOrderEmail,
          },
          role: "validatorStaff",
        });
      }
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

    // Handle credit points logic
    // if (order.usedCredits) {
    //   // Return the credits they used for this order
    //   await User.findByIdAndUpdate(order.userId, {
    //     $inc: { credits: order.usedCredits },
    //   });
    // }

    // Deduct any credits they earned from this order (if applicable)
    if (order.totalPoints) {
      await User.findByIdAndUpdate(order.userId, {
        $inc: { credits: -order.totalPoints },
      });
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

    if (order.usedCredits) {
      await User.findByIdAndUpdate(order.userId, {
        $inc: { credits: order.usedCredits }, // Return credits to the user
      });
    }

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
      const quantitySold = item.quantity;

      // Update the sold quantity in the Product collection
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { sold: -quantitySold } }, // DECREMENT the soldQuantity by the quantity sold
        { new: true, runValidators: true }
      );
    }

    // Handle credit points logic
    if (order.usedCredits) {
      // Return the credits they used for this order
      await User.findByIdAndUpdate(order.userId, {
        $inc: { credits: order.usedCredits },
      });
    }

    // Deduct any credits they earned from this order (if applicable)
    if (order.totalPoints) {
      await User.findByIdAndUpdate(order.userId, {
        $inc: { credits: -order.totalPoints },
      });
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
      "2025-01",
      "2025-02",
      "2025-03",
      "2025-04",
      "2025-05",
      "2025-06",
      "2025-07",
      "2025-08",
      "2025-09",
      "2025-10",
      "2025-11",
      "2025-12",
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

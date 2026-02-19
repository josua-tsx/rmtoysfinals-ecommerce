import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { handleMakeError } from "../middleware/handleError.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
import User from "../models/user.models.js";
import { sendSMS } from "../utils/smsService.js";
import { logAuditTrail } from "./audit.controller.js";
// import Stripe from "stripe";
import Rider from "../models/rider.models.js";
import {
  assignRider,
  handleCancelled,
  handleDelivered,
  sendOrderNotification,
  updateRiderStatus,
  validateStatus,
} from "../services/orderService.js";
import {
  validatePHMobile,
  validateFullName,
  fullNameSchema,
  phMobileSchema,
  emailSchema,
} from "../utils/validations.js";
import { z } from "zod";
import { checkAndSendStockAlerts } from "../services/stockAlert.service.js";



// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // MUST be initialized

export const userPlaceOrder = async (req, res, next) => {
  const userId = req.user.id;
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    shippingPrice,
    subtotal,
    totalPrice,
    notes,
    totalPoints,
    usedCredits,
    vatableSalesNet,
    vatExemptSales,
    totalVatAmount,
  } = req.body;

  // VERIFICATION CHECK
  if (req.user) {
    const user = await User.findById(userId);
    if (!user) {
      return next(handleMakeError(404, "User not found"));
    }

    if (!user.isPhoneVerified) {
      return next(
        handleMakeError(
          400,
          "Please verify your phone number in your profile before placing an order."
        )
      );
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* 
      VALIDATION REFACTOR NOTE:
      Manual validations for shippingAddress, orderItems, and quantities 
      have been removed. These are now handled by Zod middleware 
      in routes/order.route.js
    */

    // Process order items
    let orderItemsWithQuantity = orderItems.map((item) => ({
      ...item,
      quantity: item.quantity || 1,
    }));

    let totalItemsOrdered = orderItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    // Business Logic: Check Stocks (Keep this as it's database-dependent)
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
      vatableSalesNet,
      vatExemptSales,
       totalVatAmount,
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

    // Trigger stock alerts (fire and forget)
    checkAndSendStockAlerts();

    // Clear cart
    const userCart = await Cart.findOne({ userId }).session(session);
    // update cart: Remove items that have isSelected === true
    if (userCart && Array.isArray(userCart.items)) {
      userCart.items = userCart.items.filter(
        (item) => item.isSelected !== true
      );
    }

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




// export const guestOrderStripe = async (req, res, next) => {
//   const session = await mongoose.startSession();
//
//   try {
//     const {
//       orderItems,
//       shippingAddress,
//       paymentMethod,
//       taxPrice,
//       shippingPrice,
//       vatableSalesNet,
//       vatExemptSales,
//      totalVatAmount,
//       subtotal,
//       totalPrice,
//       notes,
//     } = req.body;
//
//     if (!Array.isArray(orderItems) || orderItems.length === 0) {
//       return next(handleMakeError(400, "Invalid or empty products array"));
//     }
//
//     try {
//       await session.startTransaction();
//
//       // IF STOCK OF SPECIFIC PRODUCT IN THE CARD IS 0 THEN YOU CAN NOT ORDER IT OR PROCEED TO CHECKOUT
//       for (const item of orderItems) {
//         if (!item.productId) {
//           await session.abortTransaction();
//           return next(
//             handleMakeError(400, "Missing product ID in order items")
//           );
//         }
//
//         if (item.quantity <= 0) {
//           await session.abortTransaction();
//           return next(
//             handleMakeError(400, "Quantity must be greater than zero")
//           );
//         }
//
//         if (item.quantity > 5) {
//           await session.abortTransaction();
//           return next(
//             handleMakeError(
//               400,
//               "You can only order up to 5 items per product at a time."
//             )
//           );
//         }
//
//         const productStock = await Stocks.findOne({
//           product: item.productId,
//         }).session(session);
//
//         if (!productStock) {
//           await session.abortTransaction();
//           return next(
//             handleMakeError(400, `Product ${item.productId} not found`)
//           );
//         }
//
//         if (productStock.quantity < item.quantity) {
//           await session.abortTransaction();
//           return next(
//             handleMakeError(400, `Insufficient stock for ${item.productName}`)
//           );
//         }
//       }
//
//       const lineItems = orderItems.map((product) => {
//         if (!product.productId) {
//           return next(
//             handleMakeError(400, "Missing productId in one of the order items")
//           );
//         }
//
//         return {
//           price_data: {
//             currency: "php",
//             product_data: {
//               name: product.productName,
//               images: [product.productImages],
//             },
//             unit_amount: Math.round(product.price * 100),
//           },
//           quantity: product.quantity,
//         };
//       });
//
//       // Create a temporary order ID for guests
//       const tempOrderId = `guest-${Date.now()}-${Math.floor(
//         Math.random() * 1000
//       )}`;
//
//       const stripeSession = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         line_items: lineItems,
//         mode: "payment",
//         success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
//         metadata: {
//           userId: tempOrderId,
//           orderItems: JSON.stringify(
//             orderItems.map((item) => ({
//               productId: item.productId._id,
//               productName: item.productId.productName,
//               price: item.productId.price,
//               quantity: item.quantity,
//             }))
//           ),
//           shippingAddress: JSON.stringify(shippingAddress),
//           paymentMethod: JSON.stringify(paymentMethod),
//           taxPrice: taxPrice.toString(),
//           shippingPrice: shippingPrice.toString(),
//           vatableSalesNet: JSON.stringify(vatableSalesNet),
//           vatExemptSales: JSON.stringify( vatExemptSales),
//           totalVatAmount: JSON.stringify(totalVatAmount),
//           subtotal: subtotal.toString(),
//           totalPrice: totalPrice.toString(),
//           notes: notes || "",
//         },
//       });
//
//       await session.commitTransaction();
//       res.status(200).json({ url: stripeSession.url });
//     } catch (error) {
//       await session.abortTransaction();
//       next(error);
//     } finally {
//       session.endSession();
//     }
//   } catch (error) {
//     next(error);
//   }
// };
//
// export const placeOrderStripe = async (req, res, next) => {
//   const userId = req?.user?.id; // Will be undefined for guests
//   const session = await mongoose.startSession();
//
//   try {
//     let {
//       orderItems,
//       shippingAddress,
//       paymentMethod,
//       taxPrice,
//       shippingPrice,
//       vatableSalesNet,
//       vatExemptSales,
//       totalVatAmount,
//       subtotal,
//       totalPrice,
//       notes,
//       totalPoints,
//       usedCredits = 0, // Default for guests
//       guestUser,
//     } = req.body;
//
//     if (!Array.isArray(orderItems) || orderItems.length === 0) {
//       return next(handleMakeError(400, "Invalid or empty products array"));
//     }
//
//     // For guest orders, validate guest information
//     if (!userId) {
//       if (!guestUser?.name || !guestUser?.phone) {
//         return next(
//           handleMakeError(400, "Guest orders require name and phone number")
//         );
//       }
//     }
//
//     // VERIFICATION CHECK FOR LOGGED-IN USERS
//     if (userId) {
//       const user = await User.findById(userId);
//       if (!user) {
//         return next(handleMakeError(404, "User not found"));
//       }
//
//       if (!user.isPhoneVerified) {
//         return next(
//           handleMakeError(
//             400,
//             "Please verify your phone number in your profile before placing an order."
//           )
//         );
//       }
//     }
//
//     // Add user/guest specific data
//     if (!userId && guestUser) {
//       guestUser = {
//         name: guestUser.name,
//         phone: guestUser.phone,
//         email: guestUser.email || null,
//       };
//     }
//
//     try {
//       await session.startTransaction();
//
//       // Stock validation - handles both nested and flat structures
//       for (const item of orderItems) {
//         const productId = item.productId?._id || item._id;
//
//         if (!productId) {
//           await session.abortTransaction();
//           return next(handleMakeError(400, "Missing product ID"));
//         }
//
//         // Quantity validation (same as before)
//         if (item.quantity <= 0 || item.quantity > 5) {
//           await session.abortTransaction();
//           return next(handleMakeError(400, "Invalid quantity"));
//         }
//
//         const productStock = await Stocks.findOne({
//           product: productId,
//         }).session(session);
//         if (!productStock || productStock.quantity < item.quantity) {
//           await session.abortTransaction();
//           return next(handleMakeError(400, "Insufficient stock"));
//         }
//       }
//
//       // Prepare line items - handles both structures
//       const lineItems = orderItems.map((item) => {
//         const product = item.productId || item;
//         const productImage = Array.isArray(product.productImages)
//           ? product.productImages[0]
//           : product.productImages;
//
//         return {
//           price_data: {
//             currency: "php",
//             product_data: {
//               name: product.productName,
//               images: [productImage],
//             },
//             unit_amount: Math.round(product.price * 100),
//           },
//           quantity: item.quantity,
//         };
//       });
//
//       // Prepare metadata
//       const metadata = {
//         userId: userId || "guest",
//         orderItems: JSON.stringify(
//           orderItems.map((item) => {
//             const product = item.productId || item;
//             return {
//               productId: product._id,
//               productName: product.productName,
//               price: product.price,
//               quantity: item.quantity,
//             };
//           })
//         ),
//         shippingAddress: JSON.stringify(shippingAddress),
//         paymentMethod,
//         shippingPrice: shippingPrice.toString(),
//         vatableSalesNet: JSON.stringify(vatableSalesNet),
//         vatExemptSales: JSON.stringify(vatExemptSales),
//         totalVatAmount: JSON.stringify(totalVatAmount),
//         subtotal: subtotal.toString(),
//         totalPrice: totalPrice.toString(),
//         notes: notes || "",
//         totalPoints: totalPoints.toString(),
//         usedCredits: usedCredits.toString(),
//         guestUser: userId ? undefined : JSON.stringify(guestUser),
//       };
//
//       const stripeSession = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         line_items: lineItems,
//         mode: "payment",
//         success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
//         metadata,
//       });
//
//       await session.commitTransaction();
//       res.status(200).json({ url: stripeSession.url });
//     } catch (error) {
//       await session.abortTransaction();
//       next(error);
//     } finally {
//       session.endSession();
//     }
//   } catch (error) {
//     next(error);
//   }
// };
//
// export const checkOutSuccess = async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//
//   try {
//     const { sessionId } = req.body;
//
//     if (!sessionId) {
//       await session.abortTransaction();
//       return next(handleMakeError(400, "Invalid session ID"));
//     }
//
//     const existingOrder = await Order.findOne({
//       stripeSessionId: sessionId,
//     }).session(session);
//     if (existingOrder) {
//       await session.abortTransaction();
//       return res.status(200).json({
//         success: true,
//         message: "Order already processed",
//         order: existingOrder,
//       });
//     }
//
//     const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
//     if (!stripeSession || stripeSession.payment_status !== "paid") {
//       await session.abortTransaction();
//       return next(
//         handleMakeError(400, "Payment not completed or session invalid")
//       );
//     }
//
//     if (!stripeSession.metadata) {
//       await session.abortTransaction();
//       return next(handleMakeError(400, "Missing metadata in Stripe session"));
//     }
//
//     const {
//       userId,
//       orderItems: orderItemsStr,
//       shippingAddress: shippingAddressStr,
//       taxPrice,
//       shippingPrice,
//       vatableSalesNet,
//       vatExemptSales,
//       totalVatAmount,
//       subtotal,
//       totalPrice,
//       notes = "",
//       totalPoints,
//       usedCredits = "0",
//     } = stripeSession.metadata;
//
//     // Handle guest user data separately
//     let guestUser = {};
//     if (stripeSession.metadata.guestUser) {
//       try {
//         guestUser = JSON.parse(stripeSession.metadata.guestUser);
//       } catch (err) {
//         console.error("Error parsing guestUser:", err);
//         guestUser = {
//           name: "Guest Customer",
//           phone: "Not Provided",
//           email: null,
//         };
//       }
//     }
//
//     if (!orderItemsStr) {
//       await session.abortTransaction();
//       return next(handleMakeError(400, "Missing order items in metadata"));
//     }
//
//     let orderItems, shippingAddress;
//     try {
//       orderItems = JSON.parse(orderItemsStr);
//       shippingAddress = shippingAddressStr
//         ? JSON.parse(shippingAddressStr)
//         : {};
//     } catch (err) {
//       await session.abortTransaction();
//       return next(handleMakeError(400, "Invalid metadata format"));
//     }
//
//     // Validate stock
//     for (const item of orderItems) {
//       const productId = item.productId?._id || item.productId;
//       const quantity = item.quantity || 1;
//
//       const productStock = await Stocks.findOne({ product: productId }).session(
//         session
//       );
//       if (!productStock || productStock.quantity < quantity) {
//         await session.abortTransaction();
//         return next(
//           handleMakeError(400, `Insufficient stock for product ${productId}`)
//         );
//       }
//     }
//
//     // Create order data
//     const orderData = {
//       orderItems: orderItems.map((item) => ({
//         productId: item.productId?._id || item.productId,
//         quantity: item.quantity || 1,
//       })),
//       shippingAddress,
//       paymentMethod: "Online Payment",
//       paymentStatus: "Pending", // Requires validator approval
//       taxPrice: parseFloat(taxPrice) || 0,
//       shippingPrice: parseFloat(shippingPrice) || 0,
//       vatableSalesNet: parseFloat(vatableSalesNet) || 0,
//       vatExemptSales: parseFloat(vatExemptSales) || 0,
//       totalVatAmount: parseFloat(totalVatAmount) || 0,
//       subtotal: parseFloat(subtotal) || 0,
//       totalPrice: parseFloat(totalPrice) || 0,
//       notes,
//       totalPoints: parseInt(totalPoints) || 0,
//       usedCredits: parseInt(usedCredits) || 0,
//       stripeSessionId: sessionId,
//     };
//
//     // Handle user/guest differentiation
//     if (userId && userId !== "guest") {
//       orderData.userId = userId;
//     } else {
//       orderData.isGuest = true;
//       orderData.guestUser = {
//         name: guestUser.name || "Guest Customer",
//         phone: guestUser.phone || "Not Provided",
//         email: guestUser.email || null,
//       };
//     }
//
//     const newOrder = new Order(orderData);
//     await newOrder.save({ session });
//
//     // Update stock
//     for (const item of orderItems) {
//       const productId = item.productId?._id || item.productId;
//       await Stocks.findOneAndUpdate(
//         { product: productId },
//         { $inc: { quantity: -(item.quantity || 1) } },
//         { session }
//       );
//     }
//
//     // Trigger stock alerts (fire and forget)
//     checkAndSendStockAlerts();
//
//     // Clear cart for registered users
//     if (userId && userId !== "guest") {
//
//       const userCart = await Cart.findOne({ userId }).session(session);
//       if (userCart) {
//         userCart.items = userCart.items.filter((item) => !item.isSelected)
//         await userCart.save({ session });
//       }
//
//       if (parseInt(usedCredits) > 0) {
//         await User.findByIdAndUpdate(
//           userId,
//           { $inc: { credits: -parseInt(usedCredits) } },
//           { session }
//         );
//       }
//     }
//
//     await session.commitTransaction();
//
//     res.status(200).json({
//       success: true,
//       message: "Order placed successfully!",
//       order: newOrder,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     next(error);
//   } finally {
//     session.endSession();
//   }
// };

export const placeOrderGcashQR = async (req, res, next) => {
  const userId = req.user?.id; // Will be undefined for guests
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    totalPrice,
    notes,
    totalPoints,
    shippingPrice,
    usedCredits = 0, // Default to 0 for guests
    gcashQRmethod,
    vatableSalesNet,
    vatExemptSales,
    totalVatAmount,
    guestUser, // Added guest user details
  } = req.body;

  // VERIFICATION CHECK FOR LOGGED-IN USERS
  if (userId) {
    const user = await User.findById(userId);
    if (!user) {
      return next(handleMakeError(404, "User not found"));
    }

    if (!user.isPhoneVerified) {
      return next(
        handleMakeError(
          400,
          "Please verify your phone number in your profile before placing an order."
        )
      );
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /*
      VALIDATION NOTE:
      Order items array check and quantity limits (<=0 or >5) 
      are now handled by Zod middleware.
    */

    for (const item of orderItems) {
      const productStock = await Stocks.findOne({
        product: item.productId,
      }).session(session);
      if (!productStock || productStock.quantity < item.quantity) {
        await session.abortTransaction();
        return next(
          handleMakeError(400, `Insufficient stock for ${item.productName}`)
        );
      }
    }

    /*
      VALIDATION NOTE:
      GCash fields and phone/name format validation 
      are now handled by Zod schema (phMobileSchema).
    */



     
   



    // For guest orders, validate guest information
    if (!userId) {
      if (!guestUser?.name || !guestUser?.phone || !guestUser.email) {
        await session.abortTransaction();
        return next(
          handleMakeError(400, "Guest orders require name and phone number")
        );
      }

      // 🛑 NEW CHECK: Check for existing phone number in both Users and Orders
    

      // 1. Check if the phone number belongs to an existing logged-in User
      const existingUser = await User.findOne({ phoneNumber: guestUser.phone }).session(session);
      if (existingUser) {
        await session.abortTransaction();
        return next( 
          handleMakeError(
            400,
            "This phone number is registered to an existing account. Please log in to place an order."
          )
        );
      }

      // 2. Check if there are any existing *guest* orders with this phone number
      // This is less common but checks for potential duplicate/abusive guest usage.
      // NOTE: Your business logic might prefer to allow multiple guest orders per phone.
      const existingGuestOrder = await Order.findOne({ 'guestUser.phone': guestUser.phone }).session(session);
      if (existingGuestOrder) {
        // You can customize this message. For strict control:
        await session.abortTransaction();
        return next(
          handleMakeError(
            400,
            "Another guest order is already associated with this phone number. Please log in or use a different number."
          )
        );
      }
      // 🛑 END OF NEW CHECK
    }

    // For authenticated users using credits
    if (userId && usedCredits > 0) {
      const user = await User.findById(userId).session(session);

      if (user.creditLock) {
        const now = new Date();
        const lockExpiry = new Date(user.creditLock);

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
          await session.abortTransaction();
          return next(
            handleMakeError(400, `⏳ Credits locked until ${expiryDate}`)
          );
        }
      }

      if (user.credits < usedCredits) {
        await session.abortTransaction();
        return next(handleMakeError(400, "Insufficient credits"));
      }
    }

    // Prepare order data
    const orderData = {
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingPrice,
      subtotal,
      totalPrice,
      notes,
      vatableSalesNet,
      vatExemptSales,
      totalVatAmount,
      totalPoints,
      paymentStatus: "Pending",
      isGuest: !userId,
      stripeSessionId: `gcashQR-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };

    // Add user/guest specific data
    if (userId) {
      orderData.userId = userId;
      orderData.usedCredits = usedCredits;
    } else {
      orderData.guestUser = {
        name: guestUser.name,
        phone: guestUser.phone,
        email: guestUser.email || null,
      };
    }

    // Add GCash QR details if applicable
    if (paymentMethod === "GcashQR") {

 


      orderData.gcashQRmethod = {
        gcashPhoneNumber: gcashQRmethod.gcashPhoneNumber,
        proofOfPaymentImage: gcashQRmethod.proofOfPaymentImage,
        gcashName: gcashQRmethod.gcashName || "Not provided",
      };
    }

    // Create and save the order
    const newOrder = new Order(orderData);
    await newOrder.save({ session });

    // Update user credits if authenticated
    if (userId && usedCredits > 0) {
      await User.findByIdAndUpdate(
        userId,
        { $inc: { credits: -usedCredits } },
        { session }
      );
    }

    // Update stock quantities
    for (const item of orderItems) {
      await Stocks.findOneAndUpdate(
        { product: item.productId },
        { $inc: { quantity: -item.quantity } },
        { session }
      );
    }

    // Trigger stock alerts (fire and forget)
    checkAndSendStockAlerts();

    // Clear cart if authenticated
    if (userId) {
      const userCart = await Cart.findOne({ userId }).session(session);
      if (userCart) {
        userCart.items = userCart.items.filter((item) => !item.isSelected)
        await userCart.save({ session });
      }

      // Log audit trail for authenticated users
      await logAuditTrail({
        action: "user_add_order",
        userId,
        targetId: newOrder._id,
        targetType: "UserOrder",
        details: { description: "Ordered using GcashQR" },
        role: "customer",
      });
    }

    await session.commitTransaction();
    res.status(201).json(newOrder);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getUserOrder = async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 5 } = req.query;

  try {
    const query = {
      userId,
      status: { $in: ["Pending", "Processing", "Shipped", "Out for Delivery"] },
    };

    const total = await Order.countDocuments(query);

    const userOrders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      orders: userOrders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
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
        select: "fullName email phoneNumber",
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

export const getUsersOrder = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      status: {
        $in: ["Pending", "Processing", "Shipped", "Out for Delivery"],
      },
      isGuest: false,
    };

    if (search) {
      // Find users matching search first
      const users = await User.find({
          $or: [
              { email: { $regex: search, $options: "i" } },
              { fullName: { $regex: search, $options: "i" } }
          ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      
      query.$or = [
          { _id: search }, // Will fail if search is not valid ObjectId type. We should check.
          { paymentMethod: { $regex: search, $options: "i" } },
          { paymentStatus: { $regex: search, $options: "i" } },
          { userId: { $in: userIds } }
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate({
        path: "orderItems.productId",
        select: "price preVatPrice",
      })
      .populate({
        path: "userId",
        select: "fullName email phoneNumber",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));


    res.status(200).json({
        orders,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        hasMore: total > page * limit
    });
  } catch (error) {
    next(error); 
  }
};

export const getGuestOrder = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      status: {
        $in: ["Pending", "Processing", "Shipped", "Out for Delivery"],
      },
      isGuest: true,
    };

    if (search) {
      query.$or = [
          { _id: search },
          { paymentMethod: { $regex: search, $options: "i" } },
          { paymentStatus: { $regex: search, $options: "i" } },
          { "guestUser.name": { $regex: search, $options: "i" } },
          { "guestUser.email": { $regex: search, $options: "i" } },
      ];
    }

    const total = await Order.countDocuments(query);
    
    // Fetch all orders
    const orders = await Order.find(query)
      .populate({
        path: "orderItems.productId",
        select: "price preVatPrice",
      })
      .populate({
        path: "userId",
        select: "fullName email",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
        orders,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        hasMore: total > page * limit
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSuccess = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let dbQuery = { status: "Delivered" };
    
    if (search) {
       // Find users matching search first
       const users = await User.find({
           $or: [
               { email: { $regex: search, $options: "i" } },
               { fullName: { $regex: search, $options: "i" } }
           ]
       }).select('_id');
       
       const userIds = users.map(u => u._id);
       
       dbQuery.$or = [
           { _id: search }, // Will fail if search is not valid ObjectId type. We should check.
           { paymentMethod: { $regex: search, $options: "i" } },
           { "guestUser.email": { $regex: search, $options: "i" } },
           { userId: { $in: userIds } }
       ];
    }

    const total = await Order.countDocuments(dbQuery);
    const orders = await Order.find(dbQuery)
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
        orders,
        pagination: {
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        }
    });

  } catch (error) {
    next(error); 
  }
};

export const getAllFailed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let dbQuery = {
      paymentStatus: "Failed",
      status: "Cancelled",
    };

    if (search) {
       const users = await User.find({
           $or: [
               { email: { $regex: search, $options: "i" } },
               { fullName: { $regex: search, $options: "i" } }
           ]
       }).select('_id');
       const userIds = users.map(u => u._id);
       
       dbQuery.$or = [
           { _id: search },
           { paymentMethod: { $regex: search, $options: "i" } },
           { "guestUser.email": { $regex: search, $options: "i" } },
           { userId: { $in: userIds } }
       ];
    }

    const total = await Order.countDocuments(dbQuery);
    const orders = await Order.find(dbQuery)
      .populate({
        path: "userId",
        select: "fullName email phoneNumber",
        populate: {
          path: "address",
          select: "fullAddress",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
        orders,
        pagination: {
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        }
    });
  } catch (error) {
    next(error); 
  }
};

export const getAllRefunded = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let dbQuery = {
      $or: [{ paymentStatus: "Refunded" }, { status: "Refunded" }],
    };

    if (search) {
       const users = await User.find({
           $or: [
               { email: { $regex: search, $options: "i" } },
               { fullName: { $regex: search, $options: "i" } }
           ]
       }).select('_id');
       const userIds = users.map(u => u._id);
       
       dbQuery = {
         $and: [
           dbQuery,
           {
             $or: [
               { _id: search },
               { paymentMethod: { $regex: search, $options: "i" } },
               { "guestUser.email": { $regex: search, $options: "i" } },
               { userId: { $in: userIds } }
             ]
           }
         ]
       };
    }

    const total = await Order.countDocuments(dbQuery);
    const orders = await Order.find(dbQuery)
      .populate({
        path: "userId",
        select: "fullName email phoneNumber",
        populate: {
          path: "address",
          select: "fullAddress",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
        orders,
        pagination: {
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        }
    });

  } catch (error) {
    next(error); 
  }
};

export const getAllCancelled = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;
    
    // Original logic: just status cancelled.
    // NOTE: getAllFailed also checks status Cancelled + paymentStatus Failed.
    // This one checks purely status Cancelled.
    
    let dbQuery = { status: "Cancelled" };

    if (search) {
       const users = await User.find({
           $or: [
               { email: { $regex: search, $options: "i" } },
               { fullName: { $regex: search, $options: "i" } }
           ]
       }).select('_id');
       const userIds = users.map(u => u._id);
       
       dbQuery.$or = [
           { _id: search },
           { paymentMethod: { $regex: search, $options: "i" } },
           { "guestUser.email": { $regex: search, $options: "i" } },
           { userId: { $in: userIds } }
       ];
    }

    const total = await Order.countDocuments(dbQuery);
    const orders = await Order.find(dbQuery)
      .populate({
        path: "userId",
        select: "fullName email phoneNumber",
        populate: {
          path: "address",
          select: "fullAddress",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
        orders,
        pagination: {
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        }
    });
  } catch (error) {
    next(error);
  }
};

// GET PENDING PAYMENTS FOR VALIDATOR STAFF
// Returns orders paid via GcashQR or Online Payment that need manual validation
export const getPendingPayments = async (req, res, next) => {
  try {
    const orders = await Order.find({
      paymentMethod: { $in: ["GcashQR", "Online Payment"] },
      paymentStatus: "Pending",
    })
      .populate({
        path: "userId",
        select: "fullName email phoneNumber",
      })
      .populate({
        path: "orderItems.productId",
        select: "productName productImages price",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryStatus = async (req, res, next) => {
    const { orderId } = req.params;
    const { status, isGuest, riderId } = req.body;
    const userId = req?.user?.id;
  
    try {
      /* 
        VALIDATION REFACTOR NOTE:
        Status validation handled by Zod middleware.
      */
  
      let order = await Order.findById(orderId).populate("userId");
      let rider = await Rider.findById(riderId);
  
      if (!order) return next(handleMakeError(400, "No order found!"));
  
      const isGuestOrder = isGuest || !order.userId;
  
      // Store previous rider for status updates
      const previousRiderId = order.riderId;
  
      // ====== PAYMENT VALIDATION GUARD ======
      // Block shipping-related statuses until payment is validated (except COD)
      const shippingStatuses = ["Shipped", "Out for Delivery", "Delivered"];
      if (
        shippingStatuses.includes(status) &&
        order.paymentStatus !== "Paid" &&
        order.paymentMethod !== "Cod"
      ) {
        return next(
          handleMakeError(
            400,
            "Cannot update to this status. Payment must be validated first."
          )
        );
      }

      // ====== HANDLE STATUS: SHIPPED ======
      if (status === "Shipped") {
        if (!riderId)
          return next(
            handleMakeError(
              400,
              "You must pick a rider to update status to shipped."
            )
          );
  
        if (rider?.riderStatus === "unavailable") {
          return next(
            handleMakeError(400, "This rider is unavailable for this delivery.")
          );
        }
        // assignRider already sets the rider to "unavailable"
        await assignRider(order, riderId);
      }
  
      // ====== HANDLE STATUS: CANCELLED ======
      if (status === "Cancelled" && order.status !== "Cancelled") {
        await handleCancelled(order, isGuestOrder);
  await Order.findByIdAndUpdate(orderId, {
    $set: {
      isTracked: true,
      "guestUser.phone": null
    }
  }, {new: true})
  
      }
  
      // ====== HANDLE STATUS: OUT FOR DELIVERY ======
      if (status === "Out for Delivery") {
        if (!order.riderId) {
          return next(
            handleMakeError(400, "You must pick a rider first in Shipped Status")
          );
        }
        
        // --- THIS IS THE FIX ---
        // Make the currently assigned rider unavailable
        await updateRiderStatus(order.riderId, "Out for Delivery");
        // --- END OF FIX ---
      }
  
      // ====== UPDATE ORDER ======
      order.status = status;
      if (status === "Delivered") {
        order.paymentStatus = "Paid";
      }
  
      // If moving back to Pending/Processing, remove the rider from the order
      if (status === "Pending" || status === "Processing") {
        order.riderId = null;
      }
  
      const updatedOrder = await order.save();
  
      // ====== HANDLE RIDER STATUS UPDATE ======
      
      // Handle the PREVIOUS rider (if status changes to free them up)
      // This runs when status is Delivered, Cancelled, Pending, or Processing
      if (
        status === "Delivered" ||
        status === "Cancelled" ||
        status === "Pending" ||
        status === "Processing"
      ) {
        if (previousRiderId) {
          // This makes the rider available again
          await updateRiderStatus(previousRiderId, status);
        }
      }
  
      // ====== HANDLE DELIVERED ======
      if (status === "Delivered") {
        // We check order.riderId (from the *saved* order) just in case
        if (!updatedOrder.riderId) {
          return next(
            handleMakeError(400, "You must pick a rider first in Shipped Status")
          );
        }
        await handleDelivered(updatedOrder);

    await Order.findByIdAndUpdate(orderId, {
        $set: {
          isTracked: isGuestOrder ? false : true,
        }
      }, {new: true})
      }
  
      // ====== NOTIFICATIONS ======
      await sendOrderNotification(status, updatedOrder, isGuestOrder, userId);
  
      return res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Order status update error:", error.message, error.stack);
      return next(handleMakeError(500, "Failed to update order status"));
    }
  };

export const getUserDelivered = async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 5 } = req.query;

  try {
    const query = { userId, status: "Delivered" };
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};

export const getFiveUserDelivered = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const orders = await Order.find({
      userId,
      status: "Delivered",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    if (!orders) return res.status(200).json([]);

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getUserCancelled = async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 5 } = req.query;

  try {
    const query = {
      userId,
      status: "Cancelled",
      paymentStatus: { $ne: "Failed" },
    };

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { paymentStatus, reason } = req.body;
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
      if (reason) {
        orderUpdate.reason = reason;
      }
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

      // Refund credits if the user used any
      if (order.userId && order.usedCredits > 0) {
        await User.findByIdAndUpdate(
          order.userId,
          { $inc: { credits: order.usedCredits } },
          { new: true }
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
        isTracked: false
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
  const { page = 1, limit = 5 } = req.query;

  try {
    const query = {
      userId: userId,
      $or: [{ paymentStatus: "Refunded" }, { status: "Refunded" }],
    };

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserFailed = async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 5 } = req.query;

  try {
    const query = {
      userId,
      paymentStatus: "Failed",
      status: "Cancelled",
    };

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};

// MONTHLY SALES
// export const getMonthlySales = async (req, res, next) => {
//   try {
//     const { year } = req.query;
//     const currentYear = year ? parseInt(year) : new Date().getFullYear();

//     const sales = await Order.aggregate([
//       {
//         $match: {
//           status: "Delivered",
//           paymentStatus: "Paid",
//           createdAt: {
//             $gte: new Date(`${currentYear}-01-01`),
//             $lte: new Date(`${currentYear}-12-31`),
//           },
//         },
//       },
//       {
//         $project: {
//           month: {
//             $dateToString: {
//               format: "%Y-%m",
//               date: "$createdAt",
//               timezone: "UTC",
//             },
//           },
//           // Use totalPrice directly since it's already in the schema
//           totalSales: "$totalPrice",
//           orderCount: 1,
//         },
//       },
//       {
//         $group: {
//           _id: "$month",
//           totalSales: { $sum: "$totalSales" },
//           orderCount: { $sum: 1 },
//           avgOrderValue: { $avg: "$totalSales" },
//         },
//       },
//       {
//         $sort: { _id: 1 },
//       },
//       {
//         $project: {
//           _id: 0,
//           month: "$_id",
//           totalSales: { $round: ["$totalSales", 2] },
//           orderCount: 1,
//           avgOrderValue: { $round: ["$avgOrderValue", 2] },
//         },
//       },
//     ]);

//     // If no sales for the year, return empty array with 12 months
//     const allMonths = [
//       "2025-01",
//       "2025-02",
//       "2025-03",
//       "2025-04",
//       "2025-05",
//       "2025-06",
//       "2025-07",
//       "2025-08",
//       "2025-09",
//       "2025-10",
//       "2025-11",
//       "2025-12",
//     ];

//     const completeMonthlyData = allMonths.map((month) => {
//       const matchingMonth = sales.find((s) => s.month === month);
//       return (
//         matchingMonth || {
//           month,
//           totalSales: 0,
//           orderCount: 0,
//           avgOrderValue: 0,
//         }
//       );
//     });

//     res.status(200).json(completeMonthlyData);
//   } catch (error) {
//     next(error);
//   }
// };

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


export const searchOrders = async (req, res, next) => {
  try {
    const { phoneNumber, otpToken } = req.body;

    // Check if user is authenticated and searching for their own number
    const isOwnNumber = req.user && req.user.phoneNumber === phoneNumber;

    if (!isOwnNumber) {
      // ── OTP Token Verification (Privacy Protection) ──
      if (!otpToken) {
        return next(handleMakeError(400, "Phone verification is required to view orders."));
      }

      try {
        const decoded = jwt.verify(otpToken, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded.verified || decoded.identifier !== phoneNumber) {
          return next(handleMakeError(400, "Phone verification failed. Please verify again."));
        }
      } catch (jwtError) {
        return next(handleMakeError(400, "Verification expired. Please verify your phone number again."));
      }
    }

    // Find user by phoneNumber (may not exist for guests)
    const user = await User.findOne({ phoneNumber });

    // Build query
    const query = [];

    // Search guest orders
    query.push({ 'guestUser.phone': phoneNumber });

    // If user exists, search their orders as well
    if (user) {
      query.push({ userId: user._id });
    }

    // Fetch orders
    const allOrders = await Order.find({isTracked: false, $or: query }).populate({
      path: "orderItems.productId",
      select: "productName productImages price "
    }).sort({createdAt: -1})

    if (!allOrders || allOrders.length === 0) {
      return res.status(200).json({
        success: true,
        // You might want to update the message for clarity
        message: "No untracked orders found for this phone number",
        allOrders: []
      });
    }

    return res.status(200).json({ success: true, allOrders });
  } catch (error) {
    next(error);
  }
};

export const trackSingleOrder = async(req, res, next) => {
  // const userId = req.user.id;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId })
      .populate({
        path: "orderItems.productId",
        select: "productName productImages price quantity category productImages",
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
}



export const validateGuestOrder = async (req, res, next) => {
  try {
    const { guestUser, otpToken } = req.body;

    // ── OTP Token Verification ──
    if (!otpToken) {
      return next(handleMakeError(400, "Phone verification is required. Please verify your phone number first."));
    }

    try {
      const decoded = jwt.verify(otpToken, process.env.ACCESS_TOKEN_SECRET);
      if (!decoded.verified || decoded.identifier !== guestUser?.phone) {
        return next(handleMakeError(400, "Phone verification failed. Please verify again."));
      }
    } catch (jwtError) {
      return next(handleMakeError(400, "Verification expired. Please verify your phone number again."));
    }

    // ── Existing Validation ──
    // Define Zod schema for guest validation
    const guestOrderSchema = z.object({
      name: fullNameSchema,
      phone: phMobileSchema,
      email: emailSchema,
    });

    // Validate request body
    const validationResult = guestOrderSchema.safeParse(guestUser || {});

    if (!validationResult.success) {
      return next(
        handleMakeError(400, validationResult.error.issues[0].message)
      );
    }

    const existingUser = await User.findOne({ phoneNumber: guestUser.phone });
    if (existingUser) {
      return next(handleMakeError(400, "This phone number is registered to an existing account."));
    }

    const existingGuestOrder = await Order.findOne({
      "guestUser.phone": guestUser.phone,
      paymentStatus: "Pending",
    });


    if (existingGuestOrder) {
      return next(handleMakeError(400, "A pending guest order already exists for this phone."));
    }

    const existingPhoneNumber = await Rider.findOne({
      riderPhoneNumber: guestUser.phone,
    });

    if (existingPhoneNumber) {
      return next(
        handleMakeError(
          400,
          "This phone number is already in the rider table. Try new one."
        )
      );
    }

    return res.status(200).json({ message: "Validation passed" });
  } catch (err) {
    next(err);
  }
};


export const deleteAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.deleteMany()
    if (orders.length)return res.json({message: "Empty orders", orders: []})

    res.status(200).json({success: true, message: "Succesfully deleted all orders"})
  } catch (error) {
    next(error)
  }
}

export const getAllUntracked = async (req, res, next) => {
  try {
    const orders = await Order.find({isTracked: false})
    if (!orders) res.json({messsage: "No untracked orders found", orders: []})
    res.status(200).json({success: true, message: "Succesfully untracked fetched orders", orders})
  } catch (error) {
    next(error)
  }
}

export const updateTrackStatus = async (req, res, next) => {
  try {
    const {orderId} = req.params

    const order = await Order.findByIdAndUpdate(orderId, {
      $set: {
        isTracked: true,
        "guestUser.phone": null
      }
    }, {new: true})

    if (!order) return next(handleMakeError(400, "Invalid Order ID or no Order ID"))

    res.status(200).json({success: true, message: "Successfully updated a status", order})

  } catch (error) {
    next(error)
  }
}

export const getSalesAnalytics = async (req, res, next) => {
  try {
    const dailySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const yearlySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      daily: dailySales,
      monthly: monthlySales,
      yearly: yearlySales,
    });
  } catch (error) {
    next(error);
  }
};
import { handleMakeError } from "../middleware/handleError.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import { paymongoClient } from "../server.js";



// Create a function to generate a payment link for the order
async function createPaymentLink(orderId) {
  try {
    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const amountInCents = order.totalPrice * 100;

    const response = await paymongoClient.links.create({
      amount: amountInCents,
      description: `Payment for Order #${orderId}`,
    });

    const checkoutUrl = response?.checkout_url || response?.data?.checkout_url;

    console.log(checkoutUrl);

    if (checkoutUrl) {
      // Update the order with the payment link
      order.paymentLink = checkoutUrl;
      await order.save();

      // Return the payment link
      return checkoutUrl;
    } else {
      throw new Error("Checkout URL not found in PayMongo response");
    }
  } catch (err) {
    console.error("Error creating payment link:", err);
    throw err;
  }
}



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
      quantity: item.quantity || 1, // Default to quantity 1 if not provided
    }));

    if (!shippingAddress)
      return next(
        handleMakeError(400, "You can't place an order without your address")
      );

    if (orderItems.length === 0)
      return next(
        handleMakeError(400, "You cant placed an order without products!")
      );

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
      });

      await newOrder.save();

      const userCart = await Cart.findOne({ userId });
      userCart.items = [];

      await userCart.save();

      const paymentLink = await createPaymentLink(newOrder._id);

      res.status(200).json({ message: "Order placed!", newOrder, paymentLink });
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
    const orders = await Order.find()
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

export const updateDeliveryStatus = async (req, res, next) => {
  const { orderId } = req.params; // Order ID from URL params
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

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) return next(handleMakeError(400, "order not found!"));

    res.status(200).json({ message: "Delivery Status updated sucessfully" });
  } catch (error) {}
};

export const getDeliveredCancelled = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const orders = await Order.find({
      userId,
      status: { $in: ["Delivered", "Cancelled"] },
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

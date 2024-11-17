import { handleMakeError } from "../middleware/handleError.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";

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
    if (!shippingAddress)
      return next(
        handleMakeError(400, "You can't place an order without your address")
      );

    if (orderItems.length === 0)
      return next(
        handleMakeError(400, "You cant placed an order without products!")
      );

      if (paymentMethod === "Gcash") {


        return next(handleMakeError(400, "JUST NO GCASH"))
        // const newOrder = new Order({
        //   userId,
        //   orderItems,
        //   shippingAddress,
        //   paymentMethod,
        //   taxPrice, 
        //   shippingPrice,
        //   discount,
        //   subtotal,
        //   totalPrice,
        //   notes,
        //   paymentStatus: "Pending",
        // });
    
        // await newOrder.save();
    
        // const userCart = await Cart.findOne({ userId });
        // userCart.items = [];
    
        // await userCart.save();
    
        // res.status(200).json({ message: "Order placed!", newOrder });
      }
   

      if (paymentMethod === "Cod") {
        const newOrder = new Order({
          userId,
          orderItems,
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
    const order = await Order.findOne({ _id: orderId })
      .populate({
        path: "orderItems.productId",
        select: "productName price quantity category productImages",
        populate: {
          path: "category",
          select: "categoryName",
        },
      })
      .sort({ createdAt: -1 });

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

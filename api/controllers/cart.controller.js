import { handleMakeError } from "../middleware/handleError.js";
import Cart from "../models/cart.model.js";
import Stocks from "../models/stocks.model.js";
import Wishlist from "../models/wishlist.models.js";

export const addToCart = async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      // If exists, increment quantity
      return next(handleMakeError(400, "product is already in cart"));
    } else {
      // If new, add item with product details
      cart.items.push({
        productId,
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

export const getCarts = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const carts = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select:
        "productName price points productDescription productImages discount",
      populate: {
        path: "stocks",
        select: "quantity",
      },
    });

    if (!carts || !carts.items) {
      return res.status(200).json([]);
    }

    res.status(200).json(carts);
  } catch (error) {
    next(error);
  }
};

export const deleteCart = async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart || !cart.items) return res.status(200).json([]);

    const existingCart = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // UPDATING THE CART.ITEMS = EXISTINGCART TO PERSIST THE CHANGES OR TO SAVE THE CHANGES BEFORE SAVING THE DOCUMENT
    cart.items = existingCart;

    await cart.save();

    res.status(200).json({ message: "successfully removed", existingCart });
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Validate input
    if (typeof quantity !== "number" || quantity < 0) {
      return next(handleMakeError(400, "Quantity must be a positive number"));
    }

    // Check product stock
    const productStocks = await Stocks.findOne({ product: productId });
    if (!productStocks) {
      return next(handleMakeError(404, "Product stock not found"));
    }

    if (quantity > productStocks.quantity) {
      return next(
        handleMakeError(400, "Cannot order more than available stock")
      );
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(200).json([]);
    }

    // Find the product in cart
    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    // Product not found in cart
    if (productIndex === -1) {
      return next(handleMakeError(404, "Product not found in cart"));
    }

    cart.items[productIndex].quantity = quantity;

    await cart.save();
    res.json(cart.items);
  } catch (error) {
    next(error);
  }
};

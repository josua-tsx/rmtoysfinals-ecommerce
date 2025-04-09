import { handleMakeError } from "../middleware/handleError.js";
import Cart from "../models/cart.model.js";
import Stocks from "../models/stocks.model.js";
import Wishlist from "../models/wishlist.models.js";

export const addToCart = async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (wishlist) {
      const existingInWish = wishlist.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingInWish) {
        return next(
          handleMakeError(
            400,
            "Product is already in the wishlist. Transfer it in Wishlist page"
          )
        );
      }
    }

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
      select: "productName price points productDescription productImages discount",
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

export const addCartToWish = async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    const [wishlist, cart] = await Promise.all([
      Wishlist.findOne({ userId }),
      Cart.findOne({ userId }),
    ]);

    // Validate wishlist and product existence
    if (
      !cart ||
      !cart.items.some((item) => item.productId.toString() === productId)
    ) {
      return next(handleMakeError(404, "Product not found in wishlist"));
    }

    // Create cart if doesn't exist
    const userWish = wishlist || new Wishlist({ userId, items: [] });

    // Check if product exists in cart
    const existingWishItem = userWish.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingWishItem) {
      return next(handleMakeError(400, "Product is already in cart"));
    } else {
      userWish.items.push({
        productId,
      });
    }

    // Remove from cart using MongoDB's $pull operator
    await Cart.updateOne(
      { userId },
      { $pull: { items: { productId: productId } } }
    );

    // Save cart
    await userWish.save();

    // Just send the updated cart we already have
    res.status(200).json({
      success: true,
      message: "Product moved from wishlist to cart",
      cart: userWish, // We already have all the data we need
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  try {
    const productStocks = await Stocks.findOne({ product: productId });

    if (quantity > productStocks.quantity)
      return next(
        handleMakeError(400, "You cant buy a product greater than stocks")
      );

    if (typeof quantity !== "number") {
      return next(handleMakeError(400, "Quantity must be a number"));
    } 

    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items) return res.status(200).json([]);

    const existingCart = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingCart) {
      if (quantity === 0) {
        cart.items = cart.items.filter(
          (item) => item.productId.toString() !== productId
        );
        await cart.save();
        return res.json(cart.items);
      } else {
        existingCart.quantity = quantity;
        await cart.save();
        res.json(cart.items);
      }
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    next(error);
  }
};

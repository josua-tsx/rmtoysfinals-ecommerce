import { handleMakeError } from "../middleware/handleError.js";
import Cart from "../models/cart.model.js";
import Wishlist from "../models/wishlist.models.js";

export const addToWish = async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (cart) {
      const existingInCart = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingInCart) {
        return next(
          handleMakeError(
            400,
            "Product is already in the cart and cannot be added to the wishlist"
          )
        );
      }
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    const existingWish = wishlist.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingWish) {
      return next(handleMakeError(400, "product is already in wishlist"));
    } else {
      wishlist.items.push({
        productId,
      });
    }

    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};

export const getUserWishlist = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: "items.productId",
      select: "productName price productDescription productImages",
    });

    // TO NOT HAVE ERROR. IF WISHLIST IS EMPTY THEN RETURN EMPTY ARRAY INSTEAD OF ERROR
    if (!wishlist || !wishlist.items) {
      return res.status(200).json([]);
    }

    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};

export const deleteWishlist = async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist || !wishlist.items) return res.status(200).json([]);
    const existingWish = wishlist.items.filter(
      (wish) => wish.productId.toString() !== productId
    );
    // update the wishlist
    wishlist.items = existingWish;
    await wishlist.save();
    res.status(200).json({ message: "successfully removed", existingWish });
  } catch (error) {
    next(error);
  }
};

export const addWishToCart = async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    const [wishlist, cart] = await Promise.all([
      Wishlist.findOne({ userId }),
      Cart.findOne({ userId }),
    ]);

    // Validate wishlist and product existence
    if (
      !wishlist ||
      !wishlist.items.some((item) => item.productId.toString() === productId)
    ) {
      return next(handleMakeError(404, "Product not found in wishlist"));
    }

    // Create cart if doesn't exist
    const userCart = cart || new Cart({ userId, items: [] });

    // Check if product exists in cart
    const existingCartItem = userCart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingCartItem) {
      return next(handleMakeError(400, "Product is already in cart"));
    } else {
      userCart.items.push({
        productId,
      });
    }

    // Remove from wishlist using MongoDB's $pull operator
    await Wishlist.updateOne(
      { userId },
      { $pull: { items: { productId: productId } } }
    );

    // Save cart
    await userCart.save();

    // Just send the updated cart we already have
    res.status(200).json({
      success: true,
      message: "Product moved from wishlist to cart",
      cart: userCart, // We already have all the data we need
    });
  } catch (error) {
    next(error);
  }
};


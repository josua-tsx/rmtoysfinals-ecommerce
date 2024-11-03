import { handleMakeError } from "../middleware/handleError.js";
import Cart from "../models/cart.model.js";

export const addToCart = async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingInWish = cart.items.find(
      (item) => item.productId.toString() === productId && item.isWishList
    );

    if (existingInWish) {
      return next(handleMakeError(400, "Product is already in the wish"));
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId && !item.isWishList
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
      select: "productName price productDescription productImages",
    });

    if (!carts || !carts.items) {
      return res.status(200).json([]); // Return empty array instead of error
    }

    const findUserCart = carts.items.filter((item) => !item.isWishList);

    res.status(200).json(findUserCart);
  } catch (error) {
    next(error);
  }
};

export const addToWishList = async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    // Step 1: Find the user's cart
    let cart = await Cart.findOne({ userId });

    // Step 2: If no cart exists, create a new one
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Step 3: Check if the product is already in the cart
    const existingInCart = cart.items.find(
      (item) => item.productId.toString() === productId && !item.isWishList
    );

    if (existingInCart) {
      return next(handleMakeError(400, "Product is already in the cart"));
    }

    // Step 4: Check if the product is already in the wishlist
    const existingInWishlist = cart.items.find(
      (item) => item.productId.toString() === productId && item.isWishList
    );

    if (!existingInWishlist) {
     
      // Step 5: If new, add item to wishlist
      cart.items.push({
        productId,
        isWishList: true,
      });
    }

    // Step 6: Save the cart and return the updated cart
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};


export const getUserWishList = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Only fetch items where isWishList is true using MongoDB projection
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "productName price productDescription productImages",
    });

    if (!cart || !cart.items) {
      return res.status(200).json([]); // Return empty array instead of error
    }

    // FILTERING ALL PRODUCTS THAT isWIshList === true then save into new array
    const findUserWishList = cart.items.filter((item) => item.isWishList);

    res.status(200).json(findUserWishList);
  } catch (error) {
    next(error);
  }
};

 
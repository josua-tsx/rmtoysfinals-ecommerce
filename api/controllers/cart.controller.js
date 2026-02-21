 import { handleMakeError } from "../middleware/handleError.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";

export const addToCart = async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product || product.isArchived) {
      return next(handleMakeError(400, "Product not found"));
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

export const updateSelect = async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { isSelected } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items) return res.status(200).json([]);

    const cartItem = cart.items.find(
      (product) => product.productId.toString() === productId
    );

    if (!cartItem) {
      return next(handleMakeError(404, "Product not found in cart"));
    }

    cartItem.isSelected = isSelected;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Successfully updated cart selection",
      data: {
        productId,
        isSelected,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCarts = async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 5 } = req.query;

  try {
    const carts = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select:
        "productName price points productDescription productImages discount taxStatus isArchived status",
      populate: [
        {
          path: "stocks",
          select: "quantity",
        },
        {
          path: "vat",
          select: "vatPercent vatValue",
        },
      ],
    });

    if (!carts || !carts.items) {
      return res.status(200).json({
        items: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
        grandTotal: 0,
        totalPoints: 0,
      });
    }

    // Count total items before filtering (to detect unavailable products on the frontend)
    const rawTotal = carts.items.length;

    // Defensive check: filter out items with null productId (deleted/archived/draft products)
    const validItems = carts.items.filter(
      (item) => item.productId && !item.productId.isArchived && item.productId.status === "published"
    );

    // Calculate totals for the ENTIRE cart (not just the page)
    const grandTotal = validItems.reduce((total, item) => {
      return total + (item.productId.price || 0) * item.quantity;
    }, 0);

    const totalPoints = validItems.reduce((total, item) => {
      return total + (item.productId.points || 0) * item.quantity;
    }, 0);

    // Pagination Logic
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedItems = validItems.slice(startIndex, endIndex);

    res.status(200).json({
      items: paginatedItems,
      total: validItems.length,
      rawTotal,
      totalPages: Math.ceil(validItems.length / limitNum),
      currentPage: pageNum,
      grandTotal,
      totalPoints,
    });
  } catch (error) {
    next(error);
  }
};

export const getSelectedCart = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const carts = await Cart.findOne({
      userId,
    }).populate({
      path: "items.productId",
      select:
        "productName price points productDescription productImages taxStatus isArchived status",
      populate: [
        {
          path: "stocks",
          select: "quantity",
        },
        {
          path: "vat",
          select: "vatPercent vatValue",
        },
      ],
    });

    if (!carts || !carts.items) {
      return res.status(200).json([]);
    }

    const selectedItems = carts.items.filter(
      (item) => item.isSelected && item.productId && !item.productId.isArchived && item.productId.status === "published"
    );

    res.status(200).json(selectedItems);
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

    const cartInItems = cart.items

    if (cartInItems) {
      for (const c of cartInItems) {
        if (c.productId.toString() === productId && c.isSelected === true) {
          return next(handleMakeError(400, "You can not delete this cart since it is checked. try to uncheck it first"))
        }
      }
    }

    const existingCart = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    

    cart.items = existingCart;

    await cart.save();

    res.status(200).json({ message: "successfully removed", existingCart });
  } catch (error) {
    next(error);
  }
};

export const deleteMultiCart = async (req, res, next) => {

  try {
    const {cartIds} = req.body 
    const userId = req.user.id

    if (!Array.isArray(cartIds)) {
      return next(handleMakeError(400, "CartIds should be an array"))
    }

    const cart = await Cart.find({
      _id: {
        $in: cartIds
      }
    })

    if (cart.length !== cartIds.length) {
      const foundIds = cart.map((c) => c._id.toString());
      const missingIds = cartIds.filter((id) => !foundIds.includes(id));
      return next(
        handleMakeError(400, `cart not found: ${missingIds.join(", ")}`)
      );
    }

  } catch (error) {
    next(error)
  }
}

export const updateQuantity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Validate input (REMOVED: Handled by Zod)
    // if (typeof quantity !== "number" || quantity < 0) {
    //   return next(handleMakeError(400, "Quantity must be a positive number"));
    // }

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

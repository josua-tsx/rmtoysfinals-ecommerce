import Cart from "../models/cart.model.js";
import { handleMakeError } from "../middleware/handleError.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
import { logAuditTrail } from "./audit.controller.js";
import Review from "../models/review.model.js";
import Category from "../models/category.model.js";
import Order from "../models/order.model.js";
import { isValidText1, isValidText2 } from "../utils/validations.js";

export const addProduct = async (req, res, next) => {
  const userId = req.user.id;

  const {
    productName,
    price,
    productDescription,
    productDetails,
    discount,
    productImages,
    category,
    supplier,
  } = req.body;

  if (!category || !supplier) {
    return next(
      handleMakeError(400, "You need category or supplier to add product!")
    );
  }

  if (!productName || !productDescription) {
    return next(handleMakeError(400, "Please input required fields"));
  }

  if (!isValidText1(productName)) {
    return next(
      handleMakeError(
        400,
        "Product name should nin 5 characters, max 50 characters, no double spaces, uppercase letters allowed"
      )
    );
  }

  if (!isValidText2(productDescription)) {
    return next(
      handleMakeError(
        400,
        "Product description should max 200 characters, no double spaces, uppercase letters allowed."
      )
    );
  }

  if (price <= 0) {
    return next(handleMakeError(400, "Price cannot be 0 or negative!"));
  }

  // Lowercasing all labels and values in the productDetails array
  if (productDetails && Array.isArray(productDetails)) {
    for (let i = 0; i < productDetails.length; i++) {
      // Ensure productDetails[i] is an object and has both 'label' and 'value' properties
      if (
        productDetails[i].hasOwnProperty("label") &&
        productDetails[i].hasOwnProperty("value")
      ) {
        // Lowercase both 'label' and 'value' if they are strings
        if (typeof productDetails[i].label === "string") {
          productDetails[i].label = productDetails[i].label.toLowerCase();
        }
        if (typeof productDetails[i].value === "string") {
          productDetails[i].value = productDetails[i].value.toLowerCase();
        }
      }
    }
  }

  try {
    const existingDraftProduct = await Product.findOne({
      productName,
      status: "draft",
    });

    if (existingDraftProduct) {
      return next(
        handleMakeError(400, "This product name is already in draft")
      );
    }

    const newProduct = new Product({
      productName,
      price,
      productDescription,
      productDetails,
      discount,
      productImages,
      category,
      supplier,
    });

    await newProduct.save();

    await Category.findByIdAndUpdate(
      category,
      {
        $push: { products: newProduct._id },
      },
      { new: true }
    );

    // CREATING A AUDIT LOGS FOR CREATING A PRODUCT AS AN ADMIN
    await logAuditTrail({
      action: "create_product",
      userId,
      targetId: newProduct._id,
      targetType: "Product",
      details: {
        productName,
        price,
      },
      role: "admin",
    });

    res.status(200).json(newProduct);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    // Get query parameters for pagination, search, and sorting
    const {
      page = 1,
      limit = 10,
      categoryName,
      // price,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const skip = (page - 1) * limit;

    // Build the query object for filtering products
    const query = { status: "published" };

    // If categoryName is provided, first find the category ObjectId
    if (categoryName) {
      const category = await Category.findOne({ categoryName: categoryName });
      if (category) {
        query["category"] = category._id; // Filter by the ObjectId of the category
      } else {
        // If the category is not found, send a response with no products
        return res.status(200).json({
          products: [],
          hasMore: false,
        });
      }
    }

    // // If priceRange is provided, add price range filter
    // if (price) {
    //   const [minPrice, maxPrice] = price.split(",").map(Number);
    //   query["price"] = { $gte: minPrice, $lte: maxPrice };
    // }

    // Sorting based on query parameters
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1; // Default sort by createdAt in descending order

    // Find the products with the built query and populate related fields
    const products = await Product.find(query)
      .populate({
        path: "supplier",
        select: "supplierName",
      })
      .populate({
        path: "category",
        select: "categoryName",
      })
      .populate({
        path: "stocks",
        select: "stockQuantity",
      })
      .populate({
        path: "reviews",
        select: "commentReview rating",
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total number of products matching the query for pagination
    const totalCount = await Product.countDocuments(query);

    // Send response with products and pagination info
    res.status(200).json({
      products,
      hasMore: totalCount > page * limit,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoStocksProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: { $ne: "draft" } })
      .populate({
        path: "supplier",
        select: "supplierName",
      })
      .populate({
        path: "category",
        select: "categoryName",
      })
      .populate({
        path: "stocks",
        select: "stockQuantity",
      });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// BASICALLY FETCHING THE BEST 4 SOLD PRODUCTS
export const getBestSoldProducts = async (req, res, next) => {
  try {
    // Sorting by most sold products (descending order of 'sold')
    const sortOptions = { sold: -1 }; // Sort by sold in descending order

    // Find the top 4 products, populated with supplier, category, stocks, and reviews
    const bestSoldProducts = await Product.find()
      .populate({
        path: "supplier",
        select: "supplierName",
      })
      .populate({
        path: "category",
        select: "categoryName",
      })
      .populate({
        path: "stocks",
        select: "stockQuantity",
      })
      .populate({
        path: "reviews",
        select: "commentReview rating",
      })
      .sort(sortOptions)
      .limit(4); // Limit to the top 4 most sold products

    // Send response with best sold products
    res.status(200).json(bestSoldProducts);
  } catch (error) {
    next(error);
  }
};

export const getBestRatedProducts = async (req, res, next) => {
  try {
    // Sorting by highest rating, we need to sort by the average rating of reviews
    // But since we can't calculate average directly in the query without aggregation,
    // we will fetch products and manually calculate the average rating afterward.

    const bestRatedProducts = await Product.find()
      .populate({
        path: "supplier",
        select: "supplierName", // Populate supplierName
      })
      .populate({
        path: "category",
        select: "categoryName", // Populate categoryName
      })
      .populate({
        path: "reviews",
        select: "rating", // Populate only the rating from reviews
      });

    bestRatedProducts.forEach((product) => {
      if (product.reviews.length > 0) {
        const totalRating = product.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const averageRating = totalRating / product.reviews.length;
        product.averageRating = averageRating; // Add the averageRating property to the product
      } else {
        product.averageRating = 0; // If no reviews, set rating to 0
      }
    });

    // Sort products by average rating in descending order
    bestRatedProducts.sort((a, b) => b.averageRating - a.averageRating);

    // Limit to the top 4 most rated products
    const topRatedProducts = bestRatedProducts.slice(0, 4);

    // Send response with best rated products
    res.status(200).json(topRatedProducts);
  } catch (error) {
    next(error); // Handle errors
  }
};

export const mostReviewsProducts = async (req, res, next) => {
  try {
    const topReviewedProducts = await Product.aggregate([
      { $unwind: "$reviews" }, // Unwind the reviews array to work with individual reviews
      {
        $group: {
          _id: "$_id", // Group by product ID
          productName: { $first: "$productName" }, // Get the first product name
          productImages: { $first: "$productImages" }, // Get the first product image
          reviewCount: { $sum: 1 }, // Count the number of reviews for each product
        },
      },
      { $sort: { reviewCount: -1 } }, // Sort by the number of reviews in descending order
      { $limit: 4 }, // Limit to the top 4 products with the most reviews
    ]);

    if (topReviewedProducts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(topReviewedProducts);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const singleProduct = await Product.findById(productId);

    if (!singleProduct) return next(handleMakeError(400, "Product not found"));

    await Stocks.deleteMany({ product: productId });

    await Cart.deleteMany({ "items.productId": productId });

    await Review.deleteMany({ productId: productId });

    await Order.deleteMany({ "orderItems.productId": productId });

    await Product.findByIdAndDelete(productId);

    await logAuditTrail({
      action: "delete_product",
      userId,
      targetId: singleProduct._id,
      targetType: "Product",
      details: {
        productName: singleProduct.productName,
        price: singleProduct.price,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
};

export const editProduct = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const {
    productName,
    price,
    productDescription,
    productDetails,
    discount,
    productImages,
    category,
    supplier,
  } = req.body;

  try {
    if (!category || !supplier) {
      return next(
        handleMakeError(400, "You need category or supplier to add product!")
      );
    }

    if (price <= 0) {
      return next(handleMakeError(400, "Price cannot be 0 or negative!"));
    }

    if (!productName || !productDescription) {
      return next(handleMakeError(400, "Please input required fields"));
    }

    if (!isValidText1(productName)) {
      return next(
        handleMakeError(
          400,
          "Product name should min 5 characters, max 50 characters, no double spaces, uppercase letters allowed"
        )
      );
    }

    if (!isValidText2(productDescription)) {
      return next(
        handleMakeError(
          400,
          "Product description should max 200 characters, no double spaces, uppercase letters allowed."
        )
      );
    }

    // Lowercasing all labels and values in the productDetails array
    if (productDetails && Array.isArray(productDetails)) {
      for (let i = 0; i < productDetails.length; i++) {
        // Ensure productDetails[i] is an object and has both 'label' and 'value' properties
        if (
          productDetails[i].hasOwnProperty("label") &&
          productDetails[i].hasOwnProperty("value")
        ) {
          // Lowercase both 'label' and 'value' if they are strings
          if (typeof productDetails[i].label === "string") {
            productDetails[i].label = productDetails[i].label.toLowerCase();
          }
          if (typeof productDetails[i].value === "string") {
            productDetails[i].value = productDetails[i].value.toLowerCase();
          }
        }
      }
    }

    const updateProduct = await Product.findByIdAndUpdate(
      id,
      {
        productName,
        price,
        productDescription,
        productDetails,
        discount,
        productImages,
        category,
        status: "published",
        category,
        supplier,
      },
      {
        new: true,
      }
    );

    if (!updateProduct) {
      return next(handleMakeError(400, "Product Not Found!"));
    }

    await logAuditTrail({
      action: "update_product",
      userId,
      targetId: updateProduct._id,
      targetType: "Product",
      details: {
        productName: updateProduct.productName,
        price: updateProduct.price,
      },
      role: "admin",
    });

    res.status(200).json(updateProduct);
  } catch (error) {
    next(error);
  }
};

export const getSingleProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const getSingleProduct = await Product.findById(id)
      .populate({
        path: "category",
        select: "categoryName",
      })
      .populate({
        path: "stocks",
        select: "stockQuantity",
      })
      .populate({
        path: "reviews",
        select: "commentReview rating",
        populate: {
          path: "userId",
          select: "avatar username email",
        },
      });

    if (!getSingleProduct)
      return next(handleMakeError(400, "Product not found"));

    res.status(200).json(getSingleProduct);
  } catch (error) {
    next(error);
  }
};

// DRAFTS

export const addDraft = async (req, res, next) => {
  const userId = req.user.id;

  const {
    productName,
    price,
    productDescription,
    productDetails,
    stocks,
    discount,
    productImages,
    filters,
    category,
    supplier,
  } = req.body;

  if (!category || !supplier)
    return next(
      handleMakeError(400, "You need category or supplier to add product!")
    );

  try {
    const newDraft = new Product({
      productName,
      price,
      productDescription,
      productDetails,
      stocks,
      discount,
      productImages,
      filters,
      status: "draft",
      category,
      supplier,
    });

    await newDraft.save();

    await logAuditTrail({
      action: "draft_product",
      userId,
      targetId: newDraft._id,
      targetType: "Product",
      details: {
        productName: newDraft.productName,
        price: newDraft.price,
      },
      role: "admin",
    });

    res.status(200).json(newDraft);
  } catch (error) {
    next(error);
  }
};

export const getDrafts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: "draft" })
      .populate({
        path: "supplier",
        select: "supplierName",
      })
      .populate({
        path: "category",
        select: "categoryName",
      });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const deleteDraft = async (req, res, next) => {
  const { draftId } = req.params;

  try {
    const singleDraft = await Product.findById(draftId);

    if (!singleDraft) return next(handleMakeError(400, "Draft is not found!"));

    await Product.findByIdAndDelete(draftId);

    res.status(200).json({ message: "draft is deleted!" });
  } catch (error) {
    next(error);
  }
};

export const publishDraft = async (req, res, next) => {
  const { draftId } = req.params;

  try {
    const publishDraft = await Product.findByIdAndUpdate(
      draftId,
      {
        status: "",
      },
      { new: true }
    );

    if (!publishDraft) return next(handleMakeError(400, "draft not found"));

    res.status(200).json(publishDraft);
  } catch (error) {
    next(error);
  }
};

export const toggleBestProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    // Find the product that the user wants to toggle
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.isBestProduct) {
      const bestProductsCount = await Product.countDocuments({
        isBestProduct: true,
      });

      if (bestProductsCount >= 4) {
        return res
          .status(400)
          .json({ message: "You can only have up to 4 best products." });
      }
    }

    product.isBestProduct = !product.isBestProduct;

    await product.save();

    res.status(200).json({
      message: `Product ${
        product.isBestProduct ? "added to" : "removed from"
      } best products`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getBestProducts = async (req, res, next) => {
  try {
    const product = await Product.find({isBestProduct: true})
    if (product.length === 0) return res.status(200).json([]);
    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
}
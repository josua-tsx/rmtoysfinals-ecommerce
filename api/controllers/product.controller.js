import Cart from "../models/cart.model.js";
import { handleMakeError } from "../middleware/handleError.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
import { logAuditTrail } from "./audit.controller.js";
import Review from "../models/review.model.js";
import Category from "../models/category.model.js";
import Order from "../models/order.model.js";

export const addProduct = async (req, res, next) => {
  const userId = req.user.id;

  const {
    productName,
    price,
    productDescription,
    productDetails,
    stocks,
    discount,
    productImages,
    // filters,
    category,
    supplier,
  } = req.body;

  if (!category || !supplier) {
    return next(
      handleMakeError(400, "You need category or supplier to add product!")
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
      stocks,
      discount,
      productImages,
      // filters,
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
    const bestSoldProduct = await Product.aggregate([
      { $sort: { sold: -1 } },
      {
        $limit: 4,
      },
    ]);

    if (bestSoldProduct.length === 0) return res.status(200).json([]);

    res.status(200).json(bestSoldProduct);
  } catch (error) {
    next(error);
  }
};

export const getBestRatingProducts = async (req, res, next) => {
  try {
    const topRatedProducts = await Product.aggregate([
      // Step 1: Lookup reviews for each product
      {
        $lookup: {
          from: "reviews", // Collection name for reviews
          localField: "_id", // Local field in Product model
          foreignField: "productId", // Field in Review model
          as: "reviews", // Output array of reviews
        },
      },

      // Step 2: Calculate the average rating for each product
      {
        $addFields: {
          averageRating: {
            $avg: "$reviews.rating", // Calculate average rating based on reviews
          },
        },
      },

      // Step 3: Sort products by average rating in descending order
      {
        $sort: { averageRating: -1 },
      },

      // Step 4: Limit to the top 4 products
      {
        $limit: 4,
      },

      // Optional Step 5: Project the necessary fields to return
      {
        $project: {
          _id: 1,
          productName: 1,
          averageRating: 1, // Include the average rating in the response
          price: 1,
          productDescription: 1,
          productDetails: 1,
          productImages: 1,
          isBestProduct: 1,
        },
      },
    ]);

    // Check if any products were found and return the result
    if (topRatedProducts.length === 0) {
      return res.status(200).json([]); // Return empty array if no products found
    }

    // Send the top rated products in the response
    res.status(200).json(topRatedProducts);
  } catch (error) {
    // Handle any error that occurs
    next(error);
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
    filters,
    category,
    supplier,
  } = req.body;

  try {
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

    const updateProduct = await Product.findByIdAndUpdate(
      id,
      {
        productName,
        price,
        productDescription,
        productDetails,
        discount,
        productImages,
        // filters,
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

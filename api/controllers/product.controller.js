import Cart from "../models/cart.model.js";
import { handleMakeError } from "../middleware/handleError.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
import { logAuditTrail } from "./audit.controller.js";
import Review from "../models/review.model.js";
import Category from "../models/category.model.js";
import Order from "../models/order.model.js";

import Supplier from "../models/supplier.model.js";
import Vat from "../models/vat.models.js";
import { createProductSchema, productBodyBase } from "../schema/product.schema.js";

export const addProduct = async (req, res, next) => {
  const userId = req.user.id;

  const {
    productName,
    productDescription,
    productDetails,
    productImages,
    category,
    points,
    taxStatus,
    vat,
  } = req.body;

  /* 
    VALIDATION REFACTOR NOTE:
    Manual validations for productName, description, category, images, vat,
    and productDetails have been removed. These are now handled by 
    Zod middleware located in routes/product.route.js
  */

  /*
    // Lowercase labels/values logic (REMOVED: Handled by Zod transform)
    if (productDetails && Array.isArray(productDetails)) {
        for (let i = 0; i < productDetails.length; i++) {
            if (typeof productDetails[i].label === "string") {
            productDetails[i].label = productDetails[i].label.toLowerCase();
            }
            if (typeof productDetails[i].value === "string") {
            productDetails[i].value = productDetails[i].value.toLowerCase();
            }
        }
    }
  */

  try {
    // Check if product exists (Active, Draft, or Archived)
    // Case-insensitive check
    const existingProduct = await Product.findOne({
      productName: { $regex: new RegExp(`^${productName.trim()}$`, "i") },
    });

    if (existingProduct) {
      if (existingProduct.isArchived) {
        // --- RESTORE ARCHIVED PRODUCT ---
        existingProduct.isArchived = false;
        existingProduct.status = "pending"; 
        existingProduct.productDescription = productDescription;
        existingProduct.productDetails = productDetails;
        existingProduct.productImages = productImages;
        existingProduct.category = category;
        existingProduct.points = points;
        existingProduct.taxStatus = taxStatus;
        existingProduct.vat = taxStatus === "vatable" ? vat : null;

        await existingProduct.save();

        // Update Category correlation just in case
        await Category.findByIdAndUpdate(
            category,
            { $addToSet: { products: existingProduct._id } }, 
        );

        // Log Audit
        await logAuditTrail({
            action: "restore_product",
            userId,
            targetId: existingProduct._id,
            targetType: "Product",
            details: { productName, reason: "Restored via Add Product" },
            role: "admin",
        });

        return res.status(200).json(existingProduct);
      } else {
        // --- DUPLICATE ACTIVE PRODUCT ---
        // If it's a draft, say so. otherwise generic duplicate
        const msg = existingProduct.status === "draft" 
            ? "This product name is already in draft" 
            : "Product name already exists";
        return next(handleMakeError(400, msg));
      }
    }

    const newProduct = new Product({
      productName,
      productDescription,
      productDetails,
      productImages,
      category,
      status: "pending",
      points,
      taxStatus,
      vat: taxStatus === "vatable" ? vat : null,
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
      },
      role: "admin",
    });

    res.status(200).json(newProduct);
  } catch (error) {
    next(error);
  }
};

export const getProductColors = async (req, res, next) => {
  try {
    const colors = await Product.aggregate([
      { $match: { status: "published", isArchived: { $ne: true } } },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.label": "color" } },
      { $group: { _id: "$productDetails.value" } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(colors.map((c) => c._id));
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
      search,
      categoryName,
      color,
      sortBy = "createdAt",
      sortOrder = "desc",
      status, // Optional status filter (e.g., "all", "draft", "published")
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build the query object for filtering products
    // Exclude archived products by default
    const query = { isArchived: { $ne: true } };

    // Status logic: 
    // - If "all", show both published and draft.
    // - If specific status provided, filter by it.
    // - Default to "published" (maintains store behavior).
    if (status === "all") {
      query.status = { $in: ["published", "draft"] };
    } else if (status) {
      query.status = status;
    } else {
      query.status = "published";
    }

    // Search logic: by productName (regex) or _id (exact)
    if (search) {
      const searchRegex = new RegExp(search, "i");
      // Check if search term looks like a valid ObjectId
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);
      
      if (isObjectId) {
        query.$or = [
          { productName: searchRegex },
          { _id: search }
        ];
      } else {
        query.productName = searchRegex;
      }
    }

    // Filter by color if provided (supports comma-separated for multi-select)
    if (color) {
      const colors = color.split(",").map((c) => c.trim()).filter(Boolean);
      if (colors.length === 1) {
        query.productDetails = {
          $elemMatch: { label: "color", value: new RegExp(`^${colors[0]}$`, "i") },
        };
      } else if (colors.length > 1) {
        query.$and = [
          ...(query.$and || []),
          {
            $or: colors.map((c) => ({
              productDetails: {
                $elemMatch: { label: "color", value: new RegExp(`^${c}$`, "i") },
              },
            })),
          },
        ];
      }
    }

    // If categoryName is provided, find the category ObjectId(s)
    // Supports comma-separated values for multi-select
    if (categoryName) {
      const categoryNames = categoryName.split(",").map((n) => n.trim()).filter(Boolean);
      const categories = await Category.find({ categoryName: { $in: categoryNames } });
      if (categories.length > 0) {
        query["category"] = { $in: categories.map((c) => c._id) };
      } else {
        return res.status(200).json({
          products: [],
          hasMore: false,
          total: 0,
          totalPages: 0
        });
      }
    }

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
        select: "quantity",
      })
      .populate({
        path: "reviews",
        select: "commentReview rating",
      })
      .populate({
        path: "vat",
        select: "vatPercent vatValue",
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get the total number of products matching the query for pagination
    const totalCount = await Product.countDocuments(query);

    // Aggregate active order counts for the fetched products
    const productIds = products.map((p) => p._id);
    const activeOrderCounts = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Pending", "Processing", "Shipped", "Out for Delivery"] },
        },
      },
      { $unwind: "$orderItems" },
      {
        $match: {
          "orderItems.productId": { $in: productIds },
        },
      },
      {
        $group: {
          _id: "$orderItems.productId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    activeOrderCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const productsWithOrderCount = products.map((p) => {
      const productObj = p.toObject();
      productObj.activeOrderCount = countMap[p._id.toString()] || 0;
      return productObj;
    });

    // Send response with products and pagination info
    res.status(200).json({
      products: productsWithOrderCount,
      hasMore: totalCount > pageNum * limitNum,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    next(error);
  }
};

export const getArchivedProducts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      search = ""
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { 
      isArchived: true,
      ...(search && { productName: { $regex: search, $options: "i" } }),
    };

    const products = await Product.find(query)
      .populate({ path: "supplier", select: "supplierName" })
      .populate({ path: "category", select: "categoryName" })
      .populate({ path: "stocks", select: "quantity" })
      .populate({ path: "vat", select: "vatPercent vatValue" })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Product.countDocuments(query);

    res.status(200).json({
      products,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockStatusPendings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Base query: pending & not archived
    const query = { status: "pending", isArchived: { $ne: true } };

    // Search logic
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { productName: searchRegex },
        { productDescription: searchRegex },
      ];
    }

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
        path: "vat",
        select: "vatPercent vatValue",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Product.countDocuments(query);

    res.status(200).json({
      products,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
    });
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
    const bestSoldProducts = await Product.find({ status: "published", isArchived: false })
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
      .limit(5); // Limit to the top 5 most sold products

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

    const bestRatedProducts = await Product.find({ status: "published", isArchived: { $ne: true } })
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
      { $match: { isArchived: { $ne: true } } },
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

    // Check if product is in any active order
    const activeOrder = await Order.findOne({
      "orderItems.productId": productId,
      status: { $in: ["Pending", "Processing", "Shipped", "Out for Delivery"] },
    });

    if (activeOrder) {
      return next(
        handleMakeError(
          400,
          "This product is in an active order and cannot be archived until the order is completed."
        )
      );
    }

    // SOFT DELETE: Mark as archived instead of removing from DB
    await Product.findByIdAndUpdate(productId, { isArchived: true });

    // Remove from Category's product list so the count updates
    if (singleProduct.category) {
      await Category.findByIdAndUpdate(singleProduct.category, {
        $pull: { products: singleProduct._id },
      });
    }

    // Remove from Supplier's product list
    if (singleProduct.supplier) {
      await Supplier.findByIdAndUpdate(singleProduct.supplier, {
        $pull: { product: singleProduct._id },
      });
    }

    // Remove from Vat's product list (using field 'productId' as per model)
    if (singleProduct.vat) {
      await Vat.findByIdAndUpdate(singleProduct.vat, {
        $pull: { productId: singleProduct._id },
      });
    }

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

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const restoreProduct = async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);

    if (!product) return next(handleMakeError(400, "Product not found"));

    if (!product.isArchived) {
      return next(handleMakeError(400, "Product is not archived"));
    }

    // Validate that category and supplier are active before restoring
    const archivedDeps = [];

    if (product.category) {
      const category = await Category.findById(product.category);
      if (!category) {
        archivedDeps.push("Category no longer exists");
      } else if (category.isArchived) {
        archivedDeps.push(`Category "${category.categoryName}" is archived`);
      }
    }

    if (product.supplier) {
      const supplier = await Supplier.findById(product.supplier);
      if (!supplier) {
        archivedDeps.push("Supplier no longer exists");
      } else if (supplier.isArchived) {
        archivedDeps.push(`Supplier "${supplier.supplierName}" is archived`);
      }
    }

    if (archivedDeps.length > 0) {
      return next(
        handleMakeError(
          400,
          `Cannot restore product. Restore these first: ${archivedDeps.join(", ")}`
        )
      );
    }

    await Product.findByIdAndUpdate(productId, { isArchived: false });

    // Add back to Category's product list
    if (product.category) {
      await Category.findByIdAndUpdate(product.category, {
        $addToSet: { products: product._id },
      });
    }

    // Add back to Supplier's product list
    if (product.supplier) {
      await Supplier.findByIdAndUpdate(product.supplier, {
        $addToSet: { product: product._id },
      });
    }

    // Add back to Vat's product list
    if (product.vat) {
      await Vat.findByIdAndUpdate(product.vat, {
        $addToSet: { productId: product._id },
      });
    }

    await logAuditTrail({
      action: "restore_product",
      userId,
      targetId: product._id,
      targetType: "Product",
      details: {
        productName: product.productName,
      },
      role: "admin",
    });
    
    res.status(200).json({ message: "Product restored successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteMultiProduct = async (req, res, next) => {
  const { productIds } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(productIds)) {
    return next(handleMakeError(400, "ProductIds should be an array"));
  }

  try {
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      const foundIds = products.map((c) => c._id.toString());
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      return next(
        handleMakeError(400, `Products not found: ${missingIds.join(", ")}`)
      );
    }

    // Soft Delete (Archive) each product
    for (const product of products) {
      // 1. Mark as Archived
      // Check if any product is in an active order
      const activeOrder = await Order.findOne({
        "orderItems.productId": product._id,
        status: { $in: ["Pending", "Processing", "Shipped", "Out for Delivery"] },
      });

      if (activeOrder) {
        return next(
          handleMakeError(
            400,
            `Product "${product.productName}" is in an active order and cannot be archived.`
          )
        );
      }

      await Product.findByIdAndUpdate(product._id, { isArchived: true });

      // 2. Remove from Category
      if (product.category) {
        await Category.findByIdAndUpdate(product.category, {
          $pull: { products: product._id },
        });
      }

      // 3. Remove from Supplier
      if (product.supplier) {
        await Supplier.findByIdAndUpdate(product.supplier, {
          $pull: { product: product._id },
        });
      }

      // 4. Remove from Vat
      if (product.vat) {
        await Vat.findByIdAndUpdate(product.vat, {
          $pull: { productId: product._id },
        });
      }
      
      // NOTE: We do NOT delete Stocks, Orders, Reviews, or Cart items in a soft delete.
      // This preserves history.
    }

    await Promise.all(
      products.map((product) =>
        logAuditTrail({
          action: "delete_product_bulk",
          userId,
          targetId: product._id,
          targetType: "Product",
          details: {
            productName: product.productName, // Changed from product.name to product.productName to match model
            archivedAt: new Date().toISOString(),
          },
          role: req.user.role,
        })
      )
    );

    res
      .status(200)
      .json({ message: "Products deleted successfully." });
  } catch (error) {
    console.error(error);
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
    productImages,
    category,
    points,
    taxStatus,
    vat,
  } = req.body;

  try {
    /* 
      VALIDATION REFACTOR NOTE:
      Manual validations for productName, description, category, images, price, vat,
      and productDetails have been removed. These are now handled by 
      Zod middleware in routes/product.route.js
    */

    /*
    // Lowercasing all labels and values in the productDetails array (REMOVED: Handled by Zod transform)
    if (productDetails && Array.isArray(productDetails)) {
      for (let i = 0; i < productDetails.length; i++) {
        if (typeof productDetails[i].label === "string") {
          productDetails[i].label = productDetails[i].label.toLowerCase();
        }
        if (typeof productDetails[i].value === "string") {
          productDetails[i].value = productDetails[i].value.toLowerCase();
        }
      }
    }
    */

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return next(handleMakeError(400, "Product Not Found!"));
    }
    if (existingProduct.isArchived) {
      return next(handleMakeError(400, "Cannot edit an archived product. Restore it first."));
    }

    const updateProduct = await Product.findByIdAndUpdate(
      id,
      {
        productName,
        price,
        productDescription,
        productDetails,
        productImages,
        category,
        status: "published",
        points,
        taxStatus,
        vat: taxStatus === "vatable" ? vat : null,
      },
      {
        new: true,
      }
    ).populate({
      path: "vat",
      select: "vatPercent vatValue",
    });

    if (!updateProduct) {
      return next(handleMakeError(400, "Product Not Found!"));
    }

    const stocksToUpdate = await Stocks.find({ product: id });

    if (stocksToUpdate.length > 0) {
      // Use the product's VAT (which we just updated)
      const vatPercent = updateProduct.vat?.vatPercent || 0;
      const vatAmountPerUnit = price * (vatPercent / 100);
      const newVatShopPrice = price + vatAmountPerUnit;

      const updatePromises = stocksToUpdate.map((stock) => {
        const newVatToRemit = vatAmountPerUnit * stock.quantity;
        return Stocks.findByIdAndUpdate(
          stock._id,
          {
            $set: {
              shopPrice: price,
              vatShopPrice: newVatShopPrice,
              vatToRemit: newVatToRemit,
              vat: updateProduct.vat, // Sync VAT from product
            },
          },
          { new: true }
        );
      });

      await Promise.all(updatePromises);
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
        select: "quantity",
      })
      .populate({
        path: "reviews",
        select: "commentReview rating",
        populate: {
          path: "userId",
          select: "avatar username email",
        },
      })
      .populate({
        path: "vat",
        select: "vatPercent vatValue",
      });

    if (!getSingleProduct || getSingleProduct.isArchived)
      return next(handleMakeError(400, "Product not found"));

    res.status(200).json(getSingleProduct);
  } catch (error) {
    next(error);
  }
};

// DRAFTS

// export const addDraft = async (req, res, next) => {
//   const userId = req.user.id;

//   const {
//     productName,
//     price,
//     productDescription,
//     productDetails,
//     stocks,
//     productImages,
//     category,
//     points,
//   } = req.body;

//   if (!productName) {
//     return next(handleMakeError(400, "Please input product name"));
//   }

//   if (!productDescription) {
//     return next(handleMakeError(400, "Please input product description"));
//   }

//   if (!category) {
//     return next(handleMakeError(400, "Category is required!"));
//   }

//   if (
//     !productImages ||
//     !Array.isArray(productImages) ||
//     productImages.length === 0
//   ) {
//     return next(handleMakeError(400, "At least one product image is required"));
//   }

//   try {
//     const newDraft = new Product({
//       productName,
//       price,
//       productDescription,
//       productDetails,
//       stocks,
//       productImages,
//       status: "draft",
//       category,
//       points,
//     });

//     await newDraft.save();

//     await logAuditTrail({
//       action: "draft_product",
//       userId,
//       targetId: newDraft._id,
//       targetType: "Product",
//       details: {
//         productName: newDraft.productName,
//         price: newDraft.price,
//       },
//       role: "admin",
//     });

//     res.status(200).json(newDraft);
//   } catch (error) {
//     next(error);
//   }
// };

// export const getDrafts = async (req, res, next) => {
//   try {
//     const products = await Product.find({ status: "draft" })
//       .populate({
//         path: "supplier",
//         select: "supplierName",
//       })
//       .populate({
//         path: "category",
//         select: "categoryName",
//       });

//     res.status(200).json(products);
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteDraft = async (req, res, next) => {
//   const { draftId } = req.params;

//   try {
//     const singleDraft = await Product.findById(draftId);

//     if (!singleDraft) return next(handleMakeError(400, "Draft is not found!"));

//     await Product.findByIdAndDelete(draftId);

//     res.status(200).json({ message: "draft is deleted!" });
//   } catch (error) {
//     next(error);
//   }
// };

// export const publishDraft = async (req, res, next) => {
//   const { draftId } = req.params;

//   try {
//     const publishDraft = await Product.findByIdAndUpdate(
//       draftId,
//       {
//         status: "pending",
//       },
//       { new: true }
//     );

//     if (!publishDraft) return next(handleMakeError(400, "draft not found"));

//     res.status(200).json(publishDraft);
//   } catch (error) {
//     next(error);
//   }
// };

export const toggleBestProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    // Find the product that the user wants to toggle
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.isArchived) {
      return res.status(400).json({ message: "Cannot mark an archived product as best product. Restore it first." });
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

export const toggleProductVisibility = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.isArchived) {
      return res.status(400).json({ message: "Cannot toggle visibility of an archived product. Restore it first." });
    }

    // Toggle between published and draft
    product.status = product.status === "published" ? "draft" : "published";

    await product.save();

    res.status(200).json({
      message: `Product is now ${product.status}`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getBestProducts = async (req, res, next) => {
  try {
    const product = await Product.find({
      isBestProduct: true,
      isArchived: false,
    });
    if (product.length === 0) return res.status(200).json([]);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /product/csv-template
 * Generates and sends a CSV template file for batch product upload.
 */
export const getProductCsvTemplate = async (req, res, next) => {
  try {
    const headers = [
      "productName",
      "productDescription",
      "productDetails",
      "productImages",
      "categoryName",
      "taxStatus",
      "points",
    ];

    // Helper to escape CSV fields (wrap in quotes and escape internal quotes)
    const escapeCSV = (value) => {
      if (value.includes('"') || value.includes(',') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const exampleRow = [
      "Example Toy Name",
      "A great toy for kids aged 5+",
      '[{"label":"material","value":"plastic"},{"label":"age","value":"5+"}]',
      "https://example.com/image1.jpg,https://example.com/image2.jpg",
      "Action Figures",
      "vatable",
      "10",
    ].map(escapeCSV);

    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="product_upload_template.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /product/batch-upload
 * Parses an uploaded CSV file and creates products in bulk.
 * Expects multipart form data with a "file" field.
 */
export const batchUploadProducts = async (req, res, next) => {
  const userId = req.user.id;

  try {
    if (!req.file) {
      return next(handleMakeError(400, "No CSV file uploaded"));
    }

    // Parse CSV from buffer
    const Papa = await import("papaparse");
    const csvString = req.file.buffer.toString("utf-8");
    const parsed = Papa.default.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "CSV parsing error",
        errors: parsed.errors.map((e) => ({
          row: e.row,
          reason: e.message,
        })),
      });
    }

    const rows = parsed.data;
    if (rows.length === 0) {
      return next(handleMakeError(400, "CSV file is empty"));
    }

    // Validate required columns
    const requiredColumns = [
      "productName",
      "productDescription",
      "productDetails",
      "productImages",
      "categoryName",
      "taxStatus",
    ];
    const csvColumns = Object.keys(rows[0]);
    const missingColumns = requiredColumns.filter(
      (col) => !csvColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missingColumns.join(", ")}`,
        errors: [],
      });
    }

    // Fetch all categories and suppliers for lookup
    // Only fetch ACTIVE (non-archived) ones
    const allCategories = await Category.find({ isArchived: { $ne: true } }).lean();
    const allSuppliers = await Supplier.find({ isArchived: { $ne: true } }).lean();
    const allVats = await Vat.find({}).lean();

    const categoryMap = new Map(
      allCategories.map((c) => [c.categoryName.toLowerCase(), c])
    );

    // Get default VAT for vatable products
    const defaultVat = allVats.length > 0 ? allVats[0] : null;

    // Track product names in this batch to detect duplicates within the CSV
    const namesInBatch = new Set();

    const results = {
      created: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 for header row and 0-indexing

      try {
        // --- Validate productName ---
        const productName = row.productName?.trim();
        if (!productName) {
          results.errors.push({ row: rowNum, reason: "productName is required" });
          results.failed++;
          continue;
        }

        // --- Validate productDescription ---
        const productDescription = row.productDescription?.trim();
        if (!productDescription) {
          results.errors.push({
            row: rowNum,
            reason: "productDescription is required",
          });
          results.failed++;
          continue;
        }

        // --- Validate productDetails (JSON) ---
        let productDetails;
        try {
          productDetails = JSON.parse(row.productDetails || "[]");
          if (!Array.isArray(productDetails)) {
            throw new Error("productDetails must be an array");
          }
        } catch (e) {
          results.errors.push({
            row: rowNum,
            reason: `Invalid productDetails JSON: ${e.message}`,
          });
          results.failed++;
          continue;
        }

        // Sanitize productDetails
        productDetails = productDetails.map((detail) => ({
          label: String(detail.label || "").toLowerCase(),
          value: String(detail.value || "").toLowerCase(),
        }));

        // --- Validate productImages (comma-separated URLs) ---
        const imageUrlsRaw = row.productImages?.trim();
        if (!imageUrlsRaw) {
          results.errors.push({
            row: rowNum,
            reason: "productImages is required",
          });
          results.failed++;
          continue;
        }
        const productImages = imageUrlsRaw.split(",").map((url) => url.trim());
        if (productImages.length === 0 || productImages.some((url) => !url)) {
          results.errors.push({
            row: rowNum,
            reason: "productImages must contain at least one valid URL",
          });
          results.failed++;
          continue;
        }

        // --- Validate categoryName ---
        const categoryName = row.categoryName?.trim();
        if (!categoryName) {
          results.errors.push({ row: rowNum, reason: "categoryName is required" });
          results.failed++;
          continue;
        }

        // --- Validate taxStatus ---
        const taxStatus = row.taxStatus?.trim()?.toLowerCase();
        if (!taxStatus || !["vatable", "exempt"].includes(taxStatus)) {
          results.errors.push({
            row: rowNum,
            reason: "taxStatus must be 'vatable' or 'exempt'",
          });
          results.failed++;
          continue;
        }

        // ----------------------------------------------------
        // Use Zod Schema for validation (subset of productBodyBase)
        // Note: We validate productName, productDescription, productDetails,
        //       productImages, taxStatus here. Category/Supplier are DB lookups.
        // ----------------------------------------------------
        const validation = productBodyBase.pick({
          productName: true,
          productDescription: true,
          productDetails: true,
          productImages: true,
          points: true,
          taxStatus: true,
        }).safeParse({
          productName,
          productDescription,
          productDetails,
          productImages,
          points: parseInt(row.points, 10) || 0,
          taxStatus,
        });

        if (!validation.success) {
          const errorMessages = validation.error.issues
            .map((issue) => issue.message)
            .join(", ");
          results.errors.push({
            row: rowNum,
            reason: `Validation Error: ${errorMessages}`,
          });
          results.failed++;
          continue;
        }

        // Check duplicate in this batch
        if (namesInBatch.has(productName.toLowerCase())) {
          results.errors.push({
            row: rowNum,
            reason: `Duplicate productName '${productName}' in CSV`,
          });
          results.failed++;
          continue;
        }
        namesInBatch.add(productName.toLowerCase());

        // Check duplicate in DB
        // Check duplicate in DB
        const existingProduct = await Product.findOne({ productName });

        // Helper to find category
        const category = categoryMap.get(categoryName.toLowerCase());
        if (!category) {
          results.errors.push({
            row: rowNum,
            reason: `Category '${categoryName}' not found`,
          });
          results.failed++;
          continue;
        }

        if (existingProduct) {
          // If archived, we RESTORE and UPDATE it
          if (existingProduct.isArchived) {
             existingProduct.isArchived = false;
             existingProduct.status = "published"; // Make active
             existingProduct.productDescription = productDescription;
             existingProduct.productDetails = productDetails;
             existingProduct.productImages = productImages;
             existingProduct.category = category._id;
             existingProduct.points = parseInt(row.points, 10) || 0;
             existingProduct.taxStatus = taxStatus;
             existingProduct.vat = taxStatus === "vatable" && defaultVat ? defaultVat._id : null;
             
             await existingProduct.save();
             
             results.created++; // Treat as success
             continue;
          } else {
            // Error: Active product with same name exists
            results.errors.push({
              row: rowNum,
              reason: `Product '${productName}' already exists in database`,
            });
            results.failed++;
            continue;
          }
        }

        // --- Points (optional) ---
        const points = parseInt(row.points, 10) || 0;

        // --- Create Product ---
        const newProduct = new Product({
          productName,
          productDescription,
          productDetails,
          productImages,
          category: category._id,
          status: "pending",
          points,
          taxStatus,
          vat: taxStatus === "vatable" && defaultVat ? defaultVat._id : null,
        });

        await newProduct.save();

        // Update category
        await Category.findByIdAndUpdate(category._id, {
          $push: { products: newProduct._id },
        });

        // Audit log
        await logAuditTrail({
          action: "create_product_batch",
          userId,
          targetId: newProduct._id,
          targetType: "Product",
          details: { productName, batchUpload: true },
          role: "admin",
        });

        results.created++;
      } catch (rowError) {
        results.errors.push({
          row: rowNum,
          reason: rowError.message || "Unknown error",
        });
        results.failed++;
      }
    }

    res.status(200).json({
      success: true,
      ...results,
    });
  } catch (error) {
    next(error);
  }
};

// Validate an array of product IDs for guest cart cleanup
// Returns which IDs are still valid (published, not archived) with latest data
export const validateCartItems = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(200).json({ validIds: [], invalidIds: [], products: [] });
    }

    // Only return products that are published and not archived
    const validProducts = await Product.find({
      _id: { $in: productIds },
      status: "published",
      isArchived: { $ne: true },
    })
      .populate({ path: "stocks", select: "quantity" })
      .select("_id productName price productImages");

    const validIds = validProducts.map((p) => p._id.toString());
    const invalidIds = productIds.filter((id) => !validIds.includes(id));

    res.status(200).json({
      validIds,
      invalidIds,
      products: validProducts,
    });
  } catch (error) {
    next(error);
  }
};

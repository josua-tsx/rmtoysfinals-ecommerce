import { handleMakeError } from "../middleware/handleError.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";
import { logAuditTrail } from "./audit.controller.js";


export const addStocks = async (req, res, next) => {
  const { productId, stockQuantity } = req.body;
  const userId = req.user.id;

  try {
    // Check if a stock entry for this product already exists
    const existingStock = await Stocks.findOne({ product: productId });

    if (stockQuantity === 0) {
      return next(handleMakeError(400, "Quantity should be greater than 0!"));
    }

    if (existingStock) {
      return next(
        handleMakeError(
          400,
          "Stock for this product already exists. Use update function to modify stock."
        )
      );
    }

    // If no existing stock, create a new one
    const newStock = new Stocks({
      product: productId,
      stockQuantity,
    });

    const savedStocks = await newStock.save();

    await Product.findByIdAndUpdate(
      productId,
      {
        $push: { stocks: savedStocks._id },
        status: "published",
      },
      { new: true }
    );

    await logAuditTrail({
      action: "published_addStock_product",
      userId,
      targetId: newStock._id,
      targetType: "Product_Stock",
      details: {
        quantity: stockQuantity,
      },
      role: "admin",
    });

    res.status(201).json(newStock);
  } catch (error) {
    next(error);
  }
};

export const getStocks = async (req, res, next) => {
  try {
    // Find all stocks and populate product, supplier, and category
    const getStocks = await Stocks.find()
      .populate({
        path: "product", // Populate the product field
        select: "productImages productName", // Include fields to select from product
        populate: [
          // Use an array for nested populations
          {
            path: "category",
            select: "categoryName",
          },
          {
            path: "supplier", // Populate the supplier field in product
            select: "supplierName",
          },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json(getStocks);
  } catch (error) {
    next(error);
  }
};



export const getStockLevels = async (req, res, next) => {
  try {
    // Query for stocks based on the stock levels
    const highStock = await Stocks.find({
      stockQuantity: { $gte: 50 },
    })
      .populate({
        path: "product",
        select: "productImages productName",
      })
      .sort({ createdAt: -1 });

    const mediumStock = await Stocks.find({
      stockQuantity: { $gte: 30, $lt: 50 },
    })
      .populate({
        path: "product",
        select: "productImages productName",
      })
      .sort({ createdAt: -1 });

   

    const lowStock = await Stocks.find({ stockQuantity: { $gt: 1, $lt: 30 } })
      .populate({
        path: "product",
        select: "productImages productName",
      })
      .sort({ createdAt: -1 });


    const outOfStock = await Stocks.find({ stockQuantity: 0 })
      .populate({
        path: "product",
        select: "productImages productName",
      })
      .sort({ createdAt: -1 });

   

    // Return a response with categorized stock levels
    res.status(200).json({
      highStock,
      mediumStock,
      lowStock,
      outOfStock,
    });
  } catch (error) {
    next(error);
  }
};

// export const deleteStock = async (req, res, next) => {
//   const { stockId } = req.params;

//   try {
//     const singleStock = await Stocks.findById(stockId);
//     if (!singleStock) return next(handleMakeError(400, "no stock found!"));
//     await Stocks.findByIdAndDelete(stockId);

//     res.status(200).json({ message: "Successfully Deleted" });
//   } catch (error) {
//     next(error);
//   }
// };

export const editStock = async (req, res, next) => {
  const userId = req.user.id;

  const { stockId } = req.params;
  const { productId, stockQuantity } = req.body;

  try {
    if (stockQuantity === 0) {
      return next(handleMakeError(400, "Quantity should be greater than 0!"));
    }

    const updateStock = await Stocks.findByIdAndUpdate(
      stockId,
      {
        product: productId,
        stockQuantity,
      },
      { new: true }
    );

    if (!updateStock) {
      console.log("Update operation did not return an updated document");
      return next(handleMakeError(400, "Failed to update stock"));
    }

    await logAuditTrail({
      action: "updated_product_stockQuantity",
      userId,
      targetId: updateStock._id,
      targetType: "PRODUCT STOCKQUANTITY",
      details: {
        quantity: stockQuantity,
      },
      role: "admin",
    });

    res
      .status(200)
      .json({ message: "Stocks updated", updatedStock: updateStock });
  } catch (error) {
    console.error("Error updating stock:", error);
    next(error);
  }
};

export const getSingleStock = async (req, res, next) => {
  const { stockId } = req.params;

  try {
    const singleStock = await Stocks.findById(stockId).populate({
      path: "product",
      select: "productName",
    });
    if (!singleStock) return next(handleMakeError(400, "stock not found"));
    res.status(200).json(singleStock);
  } catch (error) {
    next(error);
  }
};

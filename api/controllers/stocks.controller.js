import { handleMakeError } from "../middleware/handleError.js";
import Product from "../models/product.model.js";
import Stocks from "../models/stocks.model.js";

export const addStocks = async (req, res, next) => {
  const { productId, stockQuantity } = req.body;

  try {
    // Check if a stock entry for this product already exists
    const existingStock = await Stocks.findOne({ product: productId });

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
      },
      { new: true }
    );

    res.status(201).json(newStock);
  } catch (error) {
    next(error);
  }
};

export const getStocks = async (req, res, next) => {
  try {
    // Find all stocks and populate product, supplier, and category
    const getStocks = await Stocks.find().populate({
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
    });

    res.status(200).json(getStocks);
  } catch (error) {
    next(error);
  }
};

export const deleteStock = async (req, res, next) => {
  const { stockId } = req.params;

  try {
    const singleStock = await Stocks.findById(stockId);
    if (!singleStock) return next(handleMakeError(400, "no stock found!"));
    await Stocks.findByIdAndDelete(stockId);

    res.status(200).json({ message: "Successfully Deleted" });
  } catch (error) {
    next(error);
  }
};

export const editStock = async (req, res, next) => {
  const { stockId } = req.params;
  const { productId, stockQuantity } = req.body;

  console.log("Updating stock:", { stockId, productId, stockQuantity });

  try {
    const existingStock = await Stocks.findOne({ product: productId });

    if (existingStock) {
      return next(
        handleMakeError(
          400,
          "Stock for this product already exists. Use update function to modify stock."
        )
      );
    }

    console.log("Existing stock:", existingStock);

    const updateStock = await Stocks.findByIdAndUpdate(
      stockId,
      {
        product: productId,
        stockQuantity,
      },
      { new: true }
    );

    console.log("Updated stock:", updateStock);

    if (!updateStock) {
      console.log("Update operation did not return an updated document");
      return next(handleMakeError(400, "Failed to update stock"));
    }

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
    const singleStock = await Stocks.findById(stockId);
    if (!singleStock) return next(handleMakeError(400, "stock not found"));
    res.status(200).json(singleStock);
  } catch (error) {
    next(error);
  }
};

import { handleMakeError } from "../middleware/handleError.js";
import Stocks from "../models/stocks.model.js";
import Vat from "../models/vat.models.js";

export const addVat = async (req, res, next) => {
  const { vatPercent, vatValue } = req.body;

  try {

   // Check that vatPercent is a number and does not exceed 10000
   if (vatPercent !== undefined && vatPercent !== null) {
    const percent = Number(vatPercent);

    if (isNaN(percent)) {
      return next(
        handleMakeError(400, "VAT percent must be a valid number.")
      );
    }

    if (percent > 10000) {
      return next(
        handleMakeError(
          400,
          "VAT percent cannot exceed 10000."
        )
      );
    }
  }
   
    const findVat = await Vat.find();

    if (findVat.length >= 1) {
      return next(
        handleMakeError(
          400,
          "You can only add 1 VAT rate. Update the existing one instead."
        )
      );
    }

    const newVat = new Vat({
      vatPercent,
      vatValue,
    });

    const existingVat = await Vat.findOne({ vatPercent });

    if (existingVat)
      return next(handleMakeError(400, "You can not add a same vat number!"));

    if (!newVat) return next(handleMakeError(400, "VAT is required!"));

    await newVat.save();

    res.status(200).json(newVat);
  } catch (error) {
    next(error);
  }
};

export const getVat = async (req, res, next) => {
  try {
    const getVat = await Vat.find().sort({ createdAt: -1 });
    if (!getVat) return next(handleMakeError(400, "No VAT found"));
    return res.status(200).json(getVat);
  } catch (error) {
    next(error);
  }
};

export const getSingleVat = async (req, res, next) => {
  const { vatId } = req.params;

  try {
    const getSingleVat = await Vat.findById(vatId);
    if (!getSingleVat) return next(handleMakeError(400, "No Vat Found!"));
    res.status(200).json(getSingleVat);
  } catch (error) {
    next(error);
  }
};

export const deleteSingleVat = async (req, res, next) => {
  const { vatId } = req.params;

  try {
    const singleVat = await Vat.findById(vatId);

    const vatInUse = await Stocks.exists({ vat: vatId });
    if (vatInUse || singleVat?.productId?.length > 0) {
      return next(handleMakeError(400, "VAT is in use and cannot be deleted"));
    }

    const deleteVat = await Vat.findByIdAndDelete(vatId);
    if (!deleteVat) return next(handleMakeError(400, "No Vat Found!"));
    res.status(200).json(deleteVat);
  } catch (error) {
    next(error);
  }
};

export const editVat = async (req, res, next) => {
  const { vatId } = req.params;
  const { vatPercent, vatValue } = req.body; // Using vatPercent (e.g., 12 for 12%)

  try {

    if (vatPercent !== undefined && vatPercent !== null) {
      const percent = Number(vatPercent);
  
      if (isNaN(percent)) {
        return next(
          handleMakeError(400, "VAT percent must be a valid number.")
        );
      }
  
      if (percent > 10000) {
        return next(
          handleMakeError(
            400,
            "VAT percent cannot exceed 10000."
          )
        );
      }
    }

    const existingVat = await Vat.findOne({
      vatPercent,                 // Find a doc with the same percent
      _id: { $ne: vatId }        // BUT only if its ID is NOT EQUAL ($ne) to the one we are editing
    });
    
    if (existingVat) {
      return next(handleMakeError(400, "That VAT percent already exists on another entry."));
    }

    // 1. Update the VAT record
    const updatedVat = await Vat.findByIdAndUpdate(
      vatId,
      { vatPercent, vatValue },
      { new: true }
    );

    if (!updatedVat) {
      return next(handleMakeError(400, "VAT not found!"));
    }

    const stocksToUpdate = await Stocks.find({ vat: vatId });

    // Calculate and update vatToRemit for each stock
    const updatePromises = stocksToUpdate.map(async (stock) => {
      // Calculate new values based on shopPrice and NEW VAT percent
      const vatAmountPerUnit = stock.shopPrice * (updatedVat.vatPercent / 100);
      const newVatShopPrice = stock.shopPrice + vatAmountPerUnit;
      const newVatToRemit = vatAmountPerUnit * stock.quantity;

      // Update the stock with all new values
      return Stocks.findByIdAndUpdate(
        stock._id,
        {
          vatShopPrice: newVatShopPrice,
          vatToRemit: newVatToRemit,
          vat: updatedVat._id, // Update VAT reference if needed
        },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      updatedVat,
    });
  } catch (error) {
    next(error);
  }
};

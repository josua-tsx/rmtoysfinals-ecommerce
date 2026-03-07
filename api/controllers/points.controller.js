import { handleMakeError } from "../middleware/handleError.js";
import Points from "../models/points.model.js";
import Product from "../models/product.model.js";

export const addPoints = async (req, res, next) => {
  const { pointsValue } = req.body;

  try {
    const existingPoints = await Points.findOne({ pointsValue });

    if (existingPoints)
      return next(handleMakeError(400, "You cannot add the same points value!"));

    const newPoints = new Points({
      pointsValue,
    });

    await newPoints.save();

    res.status(200).json(newPoints);
  } catch (error) {
    next(error);
  }
};

export const getPoints = async (req, res, next) => {
  try {
    const getPoints = await Points.find().sort({ pointsValue: 1 });
    if (!getPoints) return next(handleMakeError(400, "No Points found"));
    return res.status(200).json(getPoints);
  } catch (error) {
    next(error);
  }
};

export const getSinglePoints = async (req, res, next) => {
  const { pointsId } = req.params;

  try {
    const getSinglePoints = await Points.findById(pointsId);
    if (!getSinglePoints) return next(handleMakeError(400, "No Points Found!"));
    res.status(200).json(getSinglePoints);
  } catch (error) {
    next(error);
  }
};

export const deleteSinglePoints = async (req, res, next) => {
  const { pointsId } = req.params;

  try {
    const singlePoints = await Points.findById(pointsId);

    const pointsInUse = await Product.exists({ points: singlePoints.pointsValue });
    if (pointsInUse || singlePoints?.productId?.length > 0) {
      return next(handleMakeError(400, "Points value is in use by a product and cannot be deleted"));
    }

    const deletePoints = await Points.findByIdAndDelete(pointsId);
    if (!deletePoints) return next(handleMakeError(400, "No Points Found!"));
    res.status(200).json(deletePoints);
  } catch (error) {
    next(error);
  }
};

export const editPoints = async (req, res, next) => {
  const { pointsId } = req.params;
  const { pointsValue } = req.body;

  try {
    const existingPoints = await Points.findOne({
      pointsValue,
      _id: { $ne: pointsId }
    });
    
    if (existingPoints) {
      return next(handleMakeError(400, "That points value already exists on another entry."));
    }

    const updatedPoints = await Points.findByIdAndUpdate(
      pointsId,
      { pointsValue },
      { new: true }
    );

    if (!updatedPoints) {
      return next(handleMakeError(400, "Points not found!"));
    }

    // Usually if a point value is changed, we'd also update products that reference it.
    // However, the product `points` field stores the value directly, so we either:
    // 1. Update all products having the old pointsValue to the new pointsValue.
    // 2. Or prevent editing if it's in use.
    // Let's implement updating associated products for data consistency.
    
    // Note: We need the *old* points value to find products to update.
    // Let's modify the above to get the old value before update.
    const oldPoints = await Points.findById(pointsId);
    if (oldPoints && oldPoints.pointsValue !== pointsValue) {
        await Product.updateMany(
            { points: oldPoints.pointsValue },
            { $set: { points: pointsValue } }
        );
    }

    res.status(200).json({
      success: true,
      updatedPoints,
    });
  } catch (error) {
    next(error);
  }
};

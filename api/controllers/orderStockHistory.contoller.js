import { handleMakeError } from "../middleware/handleError.js";
import OrderStockHistory from "../models/orderStockHistory.models.js";

export const orderStockLogs = async (
  {
    action,
    userId,
    deliveryId,
    supplier,
    category,
    quantityOrdered,
    supplierPrice,
    shippingPrice,
    vatPercentApplied,
    shopPrice,
    receivedDate,
    receivedQuantity,
    totalCost,
    reason,
  },
  session = null
) => {
  try {
    const newOrderStockHistory = new OrderStockHistory({
      action,
      userId,
      deliveryId,
      supplier,
      category,
      quantityOrdered,
      supplierPrice,
      shippingPrice,
      vatPercentApplied,
      shopPrice,
      receivedDate,
      receivedQuantity,
      totalCost,
      reason,
    });

    await newOrderStockHistory.save({ session });
  } catch (error) {
    console.log(error);
  }
};

export const getOrderStockHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build base query
    const query = {};

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { deliveryId: searchRegex },
        { action: searchRegex },
      ];
    }

    const total = await OrderStockHistory.countDocuments(query);

    const history = await OrderStockHistory.find(query)
      .populate({
        path: "userId",
        select: "username",
      })
      .populate({
        path: "category",
        select: "categoryName",
      })
      .populate({
        path: "supplier",
        select: "supplierName",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      history,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      hasMore: total > page * limit,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAllHistory = async (req, res, next) => {
  try {
    const deleteAll = await OrderStockHistory.deleteMany({});
    if (!deleteAll) return next(handleMakeError(400, "Order not found!"));
    res.status(200).json(deleteAll);
  } catch (error) {
    next(error);
  }
};

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
    });

    await newOrderStockHistory.save({ session });
  } catch (error) {
    console.log(error);
  }
};

export const getOrderStockHistory = async (req, res, next) => {
  try {
    const getHistory = await OrderStockHistory.find()
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
      .sort({ createdAt: -1 });

    if (!getHistory) return next(handleMakeError(400, "No history found!"));
    res.status(200).json(getHistory);
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

import mongoose from "mongoose";

const OrderStockHistorySchemaModel = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deliveryId: {
      type: String,
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    quantityOrdered: {
      type: Number,
      required: true,
    },
    supplierPrice: {
      type: Number,
      required: true,
    },
    shippingPrice: {
      type: Number,
      required: true,
    },
    vatPercentApplied: {
      type: Number,
      required: true,
    },
    shopPrice: {
      type: Number,
      required: true,
    },
    receivedDate: {
      type: String,
      required: true,
    },
    receivedQuantity: {
      type: Number,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const OrderStockHistory = mongoose.model(
  "OrderStockHistory",
  OrderStockHistorySchemaModel
);

export default OrderStockHistory;

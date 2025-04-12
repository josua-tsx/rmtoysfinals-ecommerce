import mongoose from "mongoose";

const StocksModelSchema = new mongoose.Schema(
{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      unique: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    supplierPrice: {
      type: Number,
      required: true,
    },
    shopPrice: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: { type: Number },
    totalCost: {
      type: Number,
      default: 0,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "processing" ,"delivered"],
      default: "pending"
    },
    deliveryId: {
      type: String,
      required: true
    },
    dateDelivery: {
      type: String,
      required: true
    },
    vatPercent: {
      type: Number,
      default: 0
    },
    lastLowStockNotification: Date,
    lastOutOfStockNotification: Date,
  },
  

  {
    timestamps: true,
  }
);

const Stocks = mongoose.model("Stocks", StocksModelSchema);

export default Stocks;

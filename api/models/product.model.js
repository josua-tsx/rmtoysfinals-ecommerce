import mongoose from "mongoose";

const ProductModelSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "product name is required"],
      unique: true,
    },

    price: {
      type: Number,
      min: 0,
    },

    preVatPrice: {
      type: Number,
    },

    productDescription: {
      type: String,
      required: true,
    },

    productDetails: {
      type: Array,
      required: true,
    },


    productImages: {
      type: Array,
      required: true,
    },

    isBestProduct: {
      type: Boolean,
      default: false,
    },

    sold: {
      type: Number,
      default: 0,
    },

    points: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["draft", "pending", "processing", "published"],
      // default: "draft"
    },

    stocks: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stocks",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    taxStatus: {
      type: String,
      enum: ["vatable", "exempt"]
    },

    vat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vat",
    },

    userId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductModelSchema);

export default Product;

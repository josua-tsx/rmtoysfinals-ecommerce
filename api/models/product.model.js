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

    productDescription: {
      type: String,
      required: true,
    },

    productDetails: {
      type: Array,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
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
      default: 0
    },

    points: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["draft", "pending" ,"processing" ,"published"],
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

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductModelSchema);

export default Product;

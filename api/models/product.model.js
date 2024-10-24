import mongoose from "mongoose";

const ProductModelSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, "product name is required"],
    unique: true,
  },

  isDraft: {
    type: Boolean,
    default: false
  },

  price: {
    type: Number,
    min: 0,
    required: true,
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

  filters: {
    type: Array,
    required: true,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
  },

 
});

const Product = mongoose.model("Product", ProductModelSchema);

export default Product;

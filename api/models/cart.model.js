import mongoose from "mongoose";

const CartScehmaModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
      },
        quantity: {
          type: Number,
          requied: true,
          min: 1,
          default: 1,
        },
        isWishList: {
          type: Boolean,
          default: false
        }
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", CartScehmaModel);

export default Cart;

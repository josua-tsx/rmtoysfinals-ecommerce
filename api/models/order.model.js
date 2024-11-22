import mongoose, { mongo } from "mongoose";

const OrderModelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    orderItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
        },
      },
    ],

    shippingAddress: {
      type: String,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Gcash", "Cod"],
      default: "Gcash",
    },

    notes: {
      type: String,
    },

    reason: {
      type: String,
    },

    taxPrice: {
      type: Number,
      // required: true,
      min: 0,
      default: 0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 35,
    },

    discount: {
      type: String,
    },
    
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    imageUrl: {
      type: String,
      default: "https://cdn-icons-png.freepik.com/512/8690/8690743.png",
    },

    gcashAdditionalDetails: {
      gcashName: {
        type: String,
      },
      gcashNo: {
        type: String,
      },
      gcashRefNo: {
        type: String,
      },
      gcashReceiptImage: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", OrderModelSchema);

export default Order;

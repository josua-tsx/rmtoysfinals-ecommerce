import mongoose, { mongo } from "mongoose";

const OrderModelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isGuest: {
      type: Boolean,
      default: false,
    },

    guestUser: {
      name: { type: String },
      phone: { type: String },
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
      enum: ["Online Payment", "Cod", "GcashQR"],
      default: "Cod",
    },

    notes: {
      type: String,
    },

    reason: {
      type: String,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 35,
    },

    discount: {
      type: String,
    },

    usedCredits: {
      type: Number,
    },

    points: {
      type: Number,
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

    totalPoints: {
      type: Number,
      default: 0,
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
        "Refunded",
      ],
      default: "Pending",
    },

    shopPrice: {
      type: Number,
    },

    totalItemsOrdered: {
      type: Number,
    },

    imageUrl: {
      type: String,
      default: "https://cdn-icons-png.freepik.com/512/8690/8690743.png",
    },

    stripeSessionId: {
      type: String,
      index: true,
      sparse: true, // This allows multiple null values
    },

    gcashQRmethod: {
      gcashPhoneNumber: {
        type: Number,
      },
      proofOfPaymentImage: {
        type: String,
      },
      gcashName: {
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

import mongoose from "mongoose";

const TicketModelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    orderNumber: {
      type: String,
      trim: true,
    },

    issueType: {
      type: String,
      enum: [
        "Refund Request",
        "Shipping Issue",
        "Product Inquiry",
        "Damaged Product",
        "Order Cancellation",
        "Other",
      ],
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    messages: [
      {
        sender: {
          type: String,
          enum: ["customer", "admin"],
          required: true,
        },
        senderName: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        images: [
          {
            type: String, // Cloudinary URLs
          },
        ],
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
TicketModelSchema.index({ email: 1, createdAt: -1 });
TicketModelSchema.index({ userId: 1, createdAt: -1 });
TicketModelSchema.index({ status: 1, createdAt: -1 });

const Ticket = mongoose.model("Ticket", TicketModelSchema);

export default Ticket;

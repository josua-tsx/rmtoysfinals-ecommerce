import mongoose from "mongoose";

const RiderModelSchema = new mongoose.Schema(
  {
    order: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    riderName: {
      type: String,
      required: true,
    },

    riderPhoneNumber: {
      type: String,
      required: true,
    },

    riderStatus: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },

    successDelivered: {
      type: Number,
      default: 0,
    },

    // rating: {
    //   type: Number,
    //   required: true,
    //   min: 1,
    //   max: 5,
    // },

    // review: {
    //   type: String,
    // },
  },
  {
    timestamps: true,
  }
);

const Rider = mongoose.model("Rider", RiderModelSchema);
export default Rider;

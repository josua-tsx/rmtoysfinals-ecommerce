import mongoose from "mongoose";

const PointsModelSchema = new mongoose.Schema(
  {
    pointsValue: {
      type: Number,
      required: true,
      unique: true,
    },
    productId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

const Points = mongoose.model("Points", PointsModelSchema);

export default Points;

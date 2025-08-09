import mongoose, { mongo } from "mongoose";

const SubscribeSchemaModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    subscribedEmail: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subscribe = mongoose.model("Subscribe", SubscribeSchemaModel);

export default Subscribe;

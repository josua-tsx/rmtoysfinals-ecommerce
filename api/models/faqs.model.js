import mongoose from "mongoose";

const FaqsSchemaModel = new mongoose.Schema(
  {
    title: {
      type: String,
      uniqe: true,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Faqs = mongoose.model("Faqs", FaqsSchemaModel);

export default Faqs;

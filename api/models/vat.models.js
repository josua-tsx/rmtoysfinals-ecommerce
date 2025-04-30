import mongoose from "mongoose";

const VatModelSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      unique: true,
    },
    vatPercent: {
      type: Number,
      required: true,
      unique: true,
    },
    vatValue: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Vat = mongoose.model("Vat", VatModelSchema);

export default Vat;

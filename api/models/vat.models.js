import mongoose from "mongoose";

const VatModelSchema = new mongoose.Schema(
  {
    vatPercent: {
      type: Number,
      required: true,
      unique: true
    },
  },
  { timestamps: true }
);

const Vat = mongoose.model("Vat", VatModelSchema);

export default Vat
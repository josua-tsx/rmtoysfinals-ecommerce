import mongoose from "mongoose";

const VatModelSchema = new mongoose.Schema(
  {
    vatPercent: {
      type: Number,
      required: true,
      unique: true,
    },
    vatValue: {
      type: Number,
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

const Vat = mongoose.model("Vat", VatModelSchema);

export default Vat;

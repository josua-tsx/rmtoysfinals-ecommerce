import mongoose from "mongoose";

const SupplierModelSchema = new mongoose.Schema(
  {
    product: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    supplierName: {
      type: String,
      required: [true, "Supplier name is required"],
      unique: true,
    },
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
    },
    contactNumber: {
      type: String,
      required: true,
    },
    supplierAddress: {
      type: String,
      required: true,
    },
    enableNotifications: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

const Supplier = mongoose.model("Supplier", SupplierModelSchema);

export default Supplier;

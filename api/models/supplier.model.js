import mongoose from "mongoose";

const SupplierModelSchema = new mongoose.Schema(
  {
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
    supplierPay: {
      type: String,
      required: true,
    },
    supplierAddress: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const Supplier = mongoose.model("Supplier", SupplierModelSchema);

export default Supplier;

import mongoose from "mongoose";

const AddressModelSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      default: "Philippines",
    },

    region: {
      type: String,
      required: true,
    },

    stateProvince: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    barangay: {
      type: String,
      required: true,
    },

    streetBuildingHouseNum: {
      type: String,
      required: true,
    },

    fullAddress: {
      type: String,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// AddressModelSchema.index({ userId: 1, fullAddress: 1 }, { unique: true });

const Address = mongoose.model("Address", AddressModelSchema);

export default Address;

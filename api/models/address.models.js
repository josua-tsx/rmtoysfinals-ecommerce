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
      unique: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    isActive: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Address = mongoose.model("Address", AddressModelSchema);

export default Address;

import mongoose from "mongoose";

const GcashModelSchema = new mongoose.Schema({
  gcashUrl: {
    type: String,
    required: [true, "GCash URL is required"],
  },

  gcashName: {
    type: String,
    required: [true, "GCash Name is required"],
    unique: true
  },

  gcashStatus: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
});


const Gcash = mongoose.model("Gcash", GcashModelSchema)

export default Gcash
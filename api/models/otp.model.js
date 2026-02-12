import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true,
  },
  channel: {
    type: String,
    enum: ["sms", "email"],
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // TTL: auto-delete after 5 minutes
  },
});

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;

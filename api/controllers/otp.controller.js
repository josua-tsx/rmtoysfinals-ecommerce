import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Otp from "../models/otp.model.js";
import { sendSMS } from "../utils/smsService.js";
import { handleMakeError } from "../middleware/handleError.js";
import { phMobileSchema } from "../utils/validations.js";

/**
 * Send OTP to a guest's phone number.
 * Generates a 6-digit code, hashes it, stores in DB, and sends via SMS.
 */
export const sendGuestOtp = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number
    const phoneValidation = phMobileSchema.safeParse(phoneNumber);
    if (!phoneValidation.success) {
      return next(handleMakeError(400, phoneValidation.error.issues[0].message));
    }

    // Delete any existing OTPs for this phone (prevent stale entries)
    await Otp.deleteMany({ phoneNumber });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    // Store in DB (TTL will auto-delete after 5 min)
    await Otp.create({ phoneNumber, otp: hashedOtp });

    // Send via SMS
    const message = `Your RM Toys verification code is: ${otpCode}. This code expires in 5 minutes. Do not share this code.`;
    await sendSMS(phoneNumber, message);

    res.status(200).json({
      success: true,
      message: "OTP sent to your phone number.",
    });
  } catch (error) {
    console.error("OTP send error:", error);
    next(handleMakeError(500, "Failed to send OTP. Please try again."));
  }
};

/**
 * Verify the OTP code entered by the guest.
 * Returns a signed JWT (otpToken) valid for 15 minutes.
 */
export const verifyGuestOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return next(handleMakeError(400, "Phone number and OTP are required."));
    }

    // Find the latest OTP for this phone
    const otpRecord = await Otp.findOne({ phoneNumber }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return next(handleMakeError(400, "OTP expired or not found. Please request a new one."));
    }

    // Compare hashed OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return next(handleMakeError(400, "Invalid OTP. Please try again."));
    }

    // OTP is valid — delete it so it can't be reused
    await Otp.deleteMany({ phoneNumber });

    // Sign a short-lived JWT containing the verified phone
    const otpToken = jwt.sign(
      { phoneNumber, verified: true },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      success: true,
      message: "Phone number verified successfully.",
      otpToken,
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    next(handleMakeError(500, "Failed to verify OTP. Please try again."));
  }
};

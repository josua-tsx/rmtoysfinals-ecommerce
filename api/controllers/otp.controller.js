import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Otp from "../models/otp.model.js";
import User from "../models/user.models.js";
import { sendSMS } from "../utils/smsService.js";
import { sendGrid } from "../sendGrid/sendGrid.js";
import { handleMakeError } from "../middleware/handleError.js";
import { phMobileSchema, emailSchema } from "../utils/validations.js";
import { otpVerificationEmail } from "../template/otpEmailTemplates.js";

/**
 * Send OTP via SMS or Email.
 * POST /api/otp/send
 * Body: { identifier: string, channel: "sms" | "email" }
 */
export const sendOtp = async (req, res, next) => {
  try {
    const { identifier, channel } = req.body;
    console.log("OTP Send Request:", { identifier, channel });

    if (!identifier || !channel) {
      return next(handleMakeError(400, "Identifier and channel are required."));
    }

    if (!["sms", "email"].includes(channel)) {
      return next(handleMakeError(400, "Channel must be 'sms' or 'email'."));
    }

    // Validate identifier based on channel
    if (channel === "sms") {
      console.log("Validating SMS identifier:", identifier);
      const phoneValidation = phMobileSchema.safeParse(identifier);
      if (!phoneValidation.success) {
        console.error("SMS Validation Failed:", phoneValidation.error);
        return next(handleMakeError(400, phoneValidation.error.issues[0].message));
      }
    } else {
      const emailValidation = emailSchema.safeParse(identifier);
      if (!emailValidation.success) {
        console.log("Email validation failed:", emailValidation.error);
        return next(handleMakeError(400, emailValidation.error.issues[0].message));
      }
    }

    // Delete any existing OTPs for this identifier+channel
    await Otp.deleteMany({ identifier, channel });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    // Store in DB (TTL will auto-delete after 5 min)
    await Otp.create({ identifier, channel, otp: hashedOtp });

    // Send via appropriate channel
    if (channel === "sms") {
      const message = `Your RM Toys verification code is: ${otpCode}. This code expires in 5 minutes. Do not share this code.`;
      await sendSMS(identifier, message);
    } else {
      await sendGrid(
        identifier,
        "Your RM Toys Verification Code",
        otpVerificationEmail(otpCode)
      );
    }

    res.status(200).json({
      success: true,
      message: channel === "sms"
        ? "OTP sent to your phone number."
        : "OTP sent to your email address.",
    });
  } catch (error) {
    console.error("OTP send error:", error);
    next(handleMakeError(500, "Failed to send OTP. Please try again."));
  }
};

/**
 * Verify the OTP code.
 * POST /api/otp/verify
 * Body: { identifier: string, otp: string }
 * Returns a signed JWT (otpToken) valid for 15 minutes.
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return next(handleMakeError(400, "Identifier and OTP are required."));
    }

    // Find the latest OTP for this identifier
    const otpRecord = await Otp.findOne({ identifier }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return next(handleMakeError(400, "OTP expired or not found. Please request a new one."));
    }

    // Compare hashed OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return next(handleMakeError(400, "Invalid OTP. Please try again."));
    }

    // OTP is valid — delete it so it can't be reused
    await Otp.deleteMany({ identifier });

    // Sign a short-lived JWT containing the verified identifier
    const otpToken = jwt.sign(
      { identifier, verified: true },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      success: true,
      message: "Verification successful.",
      otpToken,
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    next(handleMakeError(500, "Failed to verify OTP. Please try again."));
  }
};

/**
 * Confirm identity verification for a logged-in user.
 * POST /api/otp/confirm-identity
 * Requires auth (requireAuth middleware).
 * Body: { otpToken: string, channel: "sms" | "email" }
 * Sets isEmailVerified or isPhoneVerified on the user.
 */
export const confirmIdentityVerification = async (req, res, next) => {
  try {
    const { otpToken, channel } = req.body;

    if (!otpToken || !channel) {
      return next(handleMakeError(400, "OTP token and channel are required."));
    }

    if (!["sms", "email"].includes(channel)) {
      return next(handleMakeError(400, "Channel must be 'sms' or 'email'."));
    }

    // Verify the otpToken JWT
    let decoded;
    try {
      decoded = jwt.verify(otpToken, process.env.ACCESS_TOKEN_SECRET);
    } catch {
      return next(handleMakeError(400, "Invalid or expired verification token."));
    }

    if (!decoded.verified || !decoded.identifier) {
      return next(handleMakeError(400, "Invalid verification token."));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(handleMakeError(404, "User not found."));
    }

    // Verify that the identifier matches the user's email/phone
    if (channel === "email") {
      if (decoded.identifier.toLowerCase() !== user.email.toLowerCase()) {
        return next(handleMakeError(400, "Verification token does not match your email."));
      }
      user.isEmailVerified = true;
    } else {
      if (decoded.identifier !== user.phoneNumber) {
        return next(handleMakeError(400, "Verification token does not match your phone number."));
      }
      user.isPhoneVerified = true;
    }

    // Clear old resetToken fields (cleanup from legacy system)
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: channel === "email"
        ? "Email verified successfully!"
        : "Phone number verified successfully!",
    });
  } catch (error) {
    console.error("Confirm identity error:", error);
    next(handleMakeError(500, "Failed to confirm verification."));
  }
};

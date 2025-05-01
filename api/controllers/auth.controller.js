import { handleMakeError } from "../middleware/handleError.js";
import User from "../models/user.models.js";
import { generateTokens } from "../utils/generateToken.js";
import { setCookies } from "../utils/setCookies.js";
// refresh token model
// import RefreshToken from "../models/refreshToken.model.js";

import jwt from "jsonwebtoken";
import { logAuditTrail } from "./audit.controller.js";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../utils/validations.js";
import { sendEmail } from "../nodemailer/nodemailer.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";

import crypto from "crypto";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// REGISTER
export const signup = async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  const email = req.body.email.toLowerCase();
  const username = req.body.username.toLowerCase();

  if (!username) {
    return next(handleMakeError(400, "Please input username"));
  }

  if (!email) {
    return next(handleMakeError(400, "Please input email"));
  }

  if (!password) {
    return next(handleMakeError(400, "Please input password"));
  }

  if (!confirmPassword) {
    return next(handleMakeError(400, "Please input confirm password"));
  }

  if (password !== confirmPassword)
    return next(handleMakeError(400, "Passwords are not equal "));

  const userEmailCheck = validateEmail(email);
  if (!userEmailCheck.valid) {
    return next(handleMakeError(400, userEmailCheck.message));
  }

  const userNameCheck = validateUsername(username);
  if (!userNameCheck.valid) {
    return next(handleMakeError(400, userNameCheck.message));
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return next(handleMakeError(400, passwordCheck.message));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(handleMakeError(400, "Email already exist"));
  }

  const usernameExist = await User.findOne({ username });
  if (usernameExist) {
    return next(handleMakeError(400, "Username already exist"));
  }

  try {
    const newUser = new User({
      email,
      username,
      password,
    });

    // authenticate
    // const { accessToken, refreshToken } = generateTokens(newUser._id);
    // await storeRefreshToken(newUser._id, refreshToken);

    // // saving the access/refresh token cookie
    // setCookies(res, accessToken, refreshToken);

    const { accessToken } = generateTokens(newUser._id);
    // await storeRefreshToken(newUser._id);

    // saving the access/refresh token cookie
    setCookies(res, accessToken);

    await newUser.save();

    await logAuditTrail({
      action: "newly_created_user",
      userId: newUser._id,
      targetId: newUser._id,
      targetType: "NewUser",
      details: {
        description: "New user created!",
      },
      role: "customer",
    });

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    });
  } catch (error) {
    next(error);
    console.log("Error in sign-up controller");
  }
};

export const signin = async (req, res, next) => {
  const { loginId, password } = req.body;

  if (!loginId) {
    return next(handleMakeError(400, "Please input email or username"));
  }

  if (!password) {
    return next(handleMakeError(400, "Please input password"));
  }

  try {
    const validUser = await User.findOne({
      $or: [
        {
          email: loginId,
        },
        {
          username: loginId,
        },
      ],
    });
    if (!validUser) return next(handleMakeError(404, "Invalid Credentials!"));

    if (validUser && (await validUser.comparePassword(password))) {
      const { accessToken } = generateTokens(validUser._id);
      // await storeRefreshToken(validUser._id, refreshToken);
      setCookies(res, accessToken);

      // EXCLUDING THE PASSWORD WITH THIS METHOD INSTEAD OF .select("-password") is wild
      // JOKES ON YOU I CANT USE .select("-password") in this messy code because if i put that after User.FindOne -
      // now i cant compare my password because it wouldnt work because there is no password to compare
      const { password: pass, ...rest } = validUser._doc;
      res.json(rest);
    } else {
      next(handleMakeError(400, "Invalid Credentials"));
    }

    if (validUser.role === "validatorStaff" || validUser.role === "admin") {
      const validUserEmail = validUser.email;
      const validUserRole = validUser.role;

      await User.findByIdAndUpdate(
        validUser._id,
        {
          $set: {
            isLoggedIn: true,
          },
        },
        { new: true }
      );

      await sendEmail(
        ADMIN_EMAIL,
        `${validUserEmail} (${validUserRole}) logged in on ${new Date().toLocaleString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
          }
        )}`
      );
    }
  } catch (error) {
    next(error);
    console.log("Error in sign-in controller");
  }
};

export const signout = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const validUser = await User.findById(userId); // Changed to findById

    if (!validUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    // Update isLoggedIn only for validatorStaff or admin
    if (validUser.role === "validatorStaff" || validUser.role === "admin") {
      const validUserEmail = validUser.email;
      const validUserRole = validUser.role;

      await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            isLoggedIn: false, // Changed from true to false for logout
          },
        },
        { new: true }
      );

      await sendEmail(
        ADMIN_EMAIL,
        `${validUserEmail} (${validUserRole}) logged out on ${new Date().toLocaleString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
          }
        )}`
      );

      return res.status(200).json({ message: "Logged out successfully!" });
    }

    res.clearCookie("accessToken");
    return res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
    console.log(error);
  }
};

// ADD WORKER

export const addWorker = async (req, res, next) => {
  const { email, username, password, confirmPassword, role, jobDescription } =
    req.body; // Extract confirmPassword
  const userId = req.user.id;

  if (!role) {
    return next(handleMakeError(400, "Please select role"));
  }

  if (!jobDescription) {
    return next(handleMakeError(400, "Please input job description"));
  }

  if (password !== confirmPassword) {
    return next(handleMakeError(400, "Passwords do not match"));
  }

  const userEmailCheck = validateEmail(email);
  if (!userEmailCheck.valid) {
    return next(handleMakeError(400, userEmailCheck.message));
  }

  const userNameCheck = validateUsername(username);
  if (!userNameCheck.valid) {
    return next(handleMakeError(400, userNameCheck.message));
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return next(handleMakeError(400, passwordCheck.message));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(handleMakeError(400, "User already exists"));
  }

  try {
    const newUser = new User({
      email,
      username,
      password,
      role,
      jobDescription,
    });

    await newUser.save();

    await logAuditTrail({
      action: "admin_add_worker",
      userId,
      targetId: newUser._id,
      targetType: "AddWorker",
      details: {
        email,
        job: role,
        jobDescription,
      },
      role: "admin",
    });

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      jobDescription: newUser.jobDescription,
    });
  } catch (error) {
    console.error("Error in addWorker controller:", error); // Log error details
    next(error);
  }
};

// Simple in-memory store for tracking reset attempts
const passwordResetAttempts = new Map(); // Stores { email: lastAttemptTimestamp }

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(handleMakeError(400, "Please input email"));
  }

  try {
    // Check if the email has a recent reset attempt
    const lastAttempt = passwordResetAttempts.get(email);
    if (lastAttempt) {
      const cooldownMs = 5 * 60 * 1000; // 5 minutes in milliseconds
      const timeSinceLastAttempt = Date.now() - lastAttempt;

      if (timeSinceLastAttempt < cooldownMs) {
        const timeLeftMinutes = Math.ceil(
          (cooldownMs - timeSinceLastAttempt) / (1000 * 60)
        );
        return next(
          handleMakeError(
            429,
            `Please wait ${timeLeftMinutes} minute(s) before requesting another reset.`
          )
        );
      }
    }

    // Record this attempt (even before checking user existence to prevent email probing)
    passwordResetAttempts.set(email, Date.now());

    const validUser = await User.findOne({ email });
    if (!validUser) {
      // Return a generic message to prevent email enumeration
      return next(
        handleMakeError(
          400,
          "If this email exists, a recovery link has been sent."
        )
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 MINUTES TOKEN EXPIRATION

    validUser.resetToken = resetToken;
    validUser.resetTokenExpiry = resetTokenExpiry;
    await validUser.save();

    const resetLink = `https://www.rmtoys.store/forget-password?token=${resetToken}`;

    await sendEmail(
      validUser.email,
      `Hello ${validUser.username},\n\nYou requested a password reset. Click the link below to set a new password (expires in 15 minutes):\n\n${resetLink}\n\nIf you didn't request this, ignore this email.`
    );

    res.status(200).json({
      success: true,
      message:
        "Recovery password sent to your email. Please wait 5 minutes before requesting another.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return next(handleMakeError(400, "Token and new password are required."));
  }

  try {
    // Find user by token and check expiry
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return next(handleMakeError(400, "Invalid or expired token."));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// const recoveryPassword = recoveryPasswordRandom(10);
// const salt = await bcrypt.genSalt(10);
// const hashedPassword = await bcrypt.hash(recoveryPassword, salt);

// const user = await User.findByIdAndUpdate(
//   validUser._id,
//   { $set: { password: hashedPassword } },
//   { new: true }
// );

// if (!user) return next(handleMakeError(400, "User not found!"));

// const recoveryPasswordRandom = (length) => {
//   const chars =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let result = "";

//   for (let i = 0; i < length; i++) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length));
//   }

//   return result;
// };

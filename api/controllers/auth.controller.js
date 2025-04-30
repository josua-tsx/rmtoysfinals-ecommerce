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
    return next(handleMakeError(400, "User already exist"));
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

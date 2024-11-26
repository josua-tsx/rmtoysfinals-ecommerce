import { handleMakeError } from "../middleware/handleError.js";
import User from "../models/user.models.js";
import { generateTokens } from "../utils/generateToken.js";
import { setCookies } from "../utils/setCookies.js";
// refresh token model
import RefreshToken from "../models/refreshToken.model.js";

import jwt from "jsonwebtoken";
import { logAuditTrail } from "./audit.controller.js";

const storeRefreshToken = async (userId, refreshToken) => {
  const token = new RefreshToken({
    userId,
    token: refreshToken,
  });
  await token.save();
};

// REGISTER
export const signup = async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(handleMakeError(400, "User already exist"));
  }

  if (!username || !email || !password || !confirmPassword)
    return next(handleMakeError(400, "Please input required fields"));

  if (password !== confirmPassword)
    return next(handleMakeError(400, "passwords are not equal "));

  try {
    const newUser = new User({
      email,
      username,
      password,
    });

    // authenticate
    const { accessToken, refreshToken } = generateTokens(newUser._id);
    await storeRefreshToken(newUser._id, refreshToken);

    // saving the access/refresh token cookie
    setCookies(res, accessToken, refreshToken);

    await newUser.save();

    await logAuditTrail({
      action: "newly_created_user",
      userId: newUser._id,
      targetId: newUser._id,
      targetType: "NewUser",
      details: {
        description: "New user created!"
      },
      role: "customer"
    })

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
  const { email, password } = req.body;

  if (!email || !password)
    return next(handleMakeError(400, "Please input required fields"));

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(handleMakeError(404, "Invalid Credentials!"));

    if (validUser && (await validUser.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(validUser._id);
      await storeRefreshToken(validUser._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      // EXCLUDING THE PASSWORD WITH THIS METHOD INSTEAD OF .select("-password") is wild
      // JOKES ON YOU I CANT USE .select("-password") in this messy code because if i put that after User.FindOne -
      // now i cant compare my password because it wouldnt work because there is no password to compare
      const { password: pass, ...rest } = validUser._doc;
      res.json(rest);
    } else {
      next(handleMakeError(400, "Invalid Credentials"));
    }
  } catch (error) {
    next(error);
    console.log("Error in sign-in controller");
  }
};

export const signout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await RefreshToken.deleteOne({
        userId: decoded.userId,
        token: refreshToken,
      });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    next(error);
  }
};

// REFRESH TOKEN

export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken)
    return next(handleMakeError("401", "No refresh token provided"));

  try {
    // check if token is valid, if token is valid then it will return the data inside the token that is saved in decoded: the data will be
    // userId
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await RefreshToken.findOne({
      userId: decoded.userId,
      token: refreshToken,
    });
    //  THE TTL IN THE SCHEMA WILL AUTOMATICALLY DELETE THE EXPIRED TOKEN ONCE THEIR DUE FILLED, SO I DONT HAVE TO USE THE OR || but to make sure
    // im just going to use it anyway
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return next(handleMakeError(401, "Invalid token or expired token"));
    }

    // GENERATE NEW ACCESS TOKEN
    // OPTIONALLY: GENERATE NEW REFRESH TOKEN (TOKEN ROTATING?? IDK THE NAME)
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    setCookies(res, newAccessToken, newRefreshToken);

    // optional updating the new refresh token in the database
    await RefreshToken.updateOne(
      { userId: decoded.userId, token: refreshToken },
      { token: newRefreshToken } // 7 days
    );

    res.json({ message: "successfully generated new tokens" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json(req.user)
  } catch (error) {
    next(error)
    console.log(error)
  }
};

// ADD WORKER

export const addWorker = async (req, res, next) => {
  const { email, username, password, confirmPassword, role, jobDescription } = req.body; // Extract confirmPassword
  const userId = req.user.id

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(handleMakeError(400, "User already exists"));
  }

  if (!username || !email || !password || !confirmPassword) {
    return next(handleMakeError(400, "Please input required fields"));
  }

  if (password !== confirmPassword) {
    return next(handleMakeError(400, "Passwords do not match"));
  }

  try {
    const newUser = new User({
      email,
      username,
      password,
      role,
      jobDescription,
    });

    // // Authenticate
    // const { accessToken, refreshToken } = generateTokens(newUser._id);
    // await storeRefreshToken(newUser._id, refreshToken);

    // Save the access/refresh token cookie
    // setCookies(res, accessToken, refreshToken);

    await newUser.save();

    await logAuditTrail({
      action: "admin_add_worker",
      userId,
      targetId: newUser._id,
      targetType: "AddWorker",
      details: {
        email,
        job: role,
        jobDescription
      },
      role: "admin"
    })

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



import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { handleMakeError } from "./handleError.js";

export const optionalAuth = async (req, res, next) => {
  const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    // No token - proceed as guest
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      // Invalid user - proceed as guest
      req.user = null;
      return next();
    }

    // Valid user - attach to request
    req.user = user;
    next();
  } catch (error) {
    // Invalid token - proceed as guest
    req.user = null;
    next();
  }
};

export const requireAuth = async (req, res, next) => {
  const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

  // if accessToken either expired or undefined
  if (!accessToken) return next(handleMakeError(401, "Sign in first to continue"));

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // CHECK IF USER EXIST
    const user = await User.findById(decoded.userId);
    // CHECK IF DONT EXIST
    if (!user) return next(handleMakeError(401, "User not found"));

    // attach the user in req.user
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};


export const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin" || req.user.role === "validatorStaff") {
        next()
    } else {
        return next(handleMakeError(401, "Only admin can access this"))
    }
}

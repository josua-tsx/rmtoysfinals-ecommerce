import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { handleMakeError } from "./handleError.js";

export const requireAuth = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  // if accessToken either expired or undefined
  if (!accessToken) return next(handleMakeError(401, "Unauthorized"));

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
    if (req.user && req.user.role === "admin") {
        next()
    } else {
        return next(handleMakeError(401, "Only admin can access this"))
    }
}

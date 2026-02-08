import { handleMakeError } from "../middleware/handleError.js";
import User from "../models/user.models.js";
import bcypt from "bcryptjs";
import { generateTokens } from "../utils/generateToken.js";
import { logAuditTrail } from "./audit.controller.js";

import Address from "../models/address.models.js";
import Review from "../models/review.model.js";

import crypto from "crypto";
import Subscribe from "../models/subscribe.model.js";
import { sendGrid } from "../sendGrid/sendGrid.js";



export const verifyUserEmail = async (req, res, next) => {
  const { email } = req.body;



  const validUser = await User.findOne({ email });

  if (!validUser) {
    return next(
      handleMakeError(
        400,
        "If this email exist, a verification email has been sent."
      )
    );
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15   hours from now

  // Update user with verification token
  validUser.resetToken = verificationToken;
  validUser.resetTokenExpiry = verificationExpires;

  // Save the validUser (assuming 'validUser' is the document you're updating)
  await validUser.save();

  // Send verification email
  const verificationUrl = process.env.NODE_ENV === "development" ? process.env.FRONTEND_URL + `/verify-email?token=${verificationToken}` : process.env.CLIENT_URL + `/verify-email?token=${verificationToken}`;

  try {
    await sendGrid(
      validUser.email,
      "Verify Your Email Address",
      `
          <p>Please click the following link to verify your email:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>This link will expire in 24 hours.</p>
        `
    );

    res.status(200).json({
      message:
        "Verification email is sent yo your email. Please wait 5 minutes before requesting a another.",
    });
  } catch (emailError) {
    return next(
      handleMakeError(400, `Failed to send verification email: ${emailError}`)
    );
  }
};

export const confirmVerifyEmail = async (req, res, next) => {
  const { token } = req.body;

  if (!token) return next(handleMakeError(400, "Token is required"));

  try {
    const validUser = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!validUser)
      return next(handleMakeError(400, "invalid or expired token."));

    const updateUser = await User.findByIdAndUpdate(
      validUser._id,
      {
        $set: {
          isEmailVerified: true,
          resetToken: undefined,
          resetTokenExpiry: undefined,
        },
      },
      { new: true }
    );

    if (!updateUser)
      return next(handleMakeError(400, "Failed to verify email."));

    res.status(200).json({
      message: "Email verified successfully!",
      affected: updateUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const id = req.params.id;
  const { username, email, password, avatar, phoneNumber, fullName } = req.body;

  const user = await User.findById(id);

  if (!user) return next(handleMakeError(400, "No user found!"));

  let isEmailChanged = false;
  let previousEmail = user.email;

  /* 
    VALIDATION REFACTOR NOTE:
    Manual validations for username, email, fullName, phoneNumber, and password 
    have been removed. These are now handled by Zod middleware in routes/user.route.js
  */

  if (username !== undefined) {
    const usernameExist = await User.findOne({ username, _id: { $ne: id } });
    if (usernameExist) {
        return next(handleMakeError(400, "Username already exists"));
    }
  }

  if (email !== undefined) {
    if (email !== user.email) {
      isEmailChanged = true;
    }
    const userExists = await User.findOne({ email, _id: { $ne: id } });
    if (userExists) {
      return next(handleMakeError(400, "Email already exists"));
    }
  }

  try {
    let hashedPassword;
    if (password) {
      const passwordCheck = validatePassword(password);
      if (!passwordCheck.valid) {
        return next(handleMakeError(400, passwordCheck.message));
      }

      hashedPassword = await bcypt.hash(password, 10);
    }

    const updateData = {
      username,
      email,
      password: hashedPassword,
      avatar,
      phoneNumber,
      fullName,
    };

    console.log(previousEmail);

    if (isEmailChanged) {
      updateData.isEmailVerified = false;
      updateData.resetToken = undefined;
      updateData.resetTokenExpiry = undefined;

      if (user.isSubscribed) {
        try {
          updateData.isSubscribed = false;
          await Subscribe.findOneAndDelete({ subscribedEmail: previousEmail });
        } catch (error) {
          next(error);
        }
      }
    }

    const currentUser = await User.findByIdAndUpdate(
      id,
      {
        $set: updateData,
      },
      { new: true }
    ).select("-password");

    res.status(201).json(currentUser);
  } catch (error) {
    next(error);
    console.log("error in update profile controller");
  }
};

export const getAll = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate({
        path: "address",
        select: "fullAddress isActive",
      })
      .sort({ createdAt: -1 });
    res.status(201).json(users);
  } catch (error) {
    next(error);
  }
};

export const getAllCustomer = async (req, res, next) => {
  try {
    const findAllCustomer = await User.find({ role: "customer" })
      .populate({
        path: "address",
        select: "fullAddress isActive",
      })
      .sort({ createdAt: -1 });
    if (!findAllCustomer) return next(handleMakeError(400, "Not found!"));
    res.status(200).json(findAllCustomer);
  } catch (error) {
    next(error);
  }
};

export const getAllWorkers = async (req, res, next) => {
  try {
    const workers = await User.find({
      // $nin: fetch those are not in (the array)
      role: { 
        $nin: ["admin", "customer"]
       },
       isArchived: { $ne: true },
    })
      .populate({
        path: "address",
        select: "fullAddress isActive",
      })
      .sort({ createdAt: -1 });

    // Check if no workers were found
    if (workers.length === 0) {
      return res.json([]);
    }

    res.status(200).json(workers);
  } catch (error) {
    next(error);
  }
};

export const deleteWorker = async (req, res, next) => {
  const userId = req.user.id;
  const { workerId } = req.params;

  try {
    const worker = await User.findById(workerId);

    if (!worker) return next(handleMakeError(400, "worker not found!"));

    // SOFT DELETE: Mark as archived
    await User.findByIdAndUpdate(workerId, { isArchived: true });

    await logAuditTrail({
      action: "archive_worker",
      userId,
      targetId: worker._id,
      targetType: "Worker",
      details: {
        email: worker.email,
        job: worker.role,
        jobDescription: worker.jobDescription,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Worker Archived" });
  } catch (error) {
    next(error);
  }
};

export const restoreWorker = async (req, res, next) => {
  const { workerId } = req.params;
  const userId = req.user.id;

  try {
    const worker = await User.findById(workerId);

    if (!worker) return next(handleMakeError(400, "Worker not found!"));

    if (!worker.isArchived) {
      return next(handleMakeError(400, "Worker is not archived"));
    }

    await User.findByIdAndUpdate(workerId, { isArchived: false });

    await logAuditTrail({
      action: "restore_worker",
      userId,
      targetId: worker._id,
      targetType: "Worker",
      details: {
        email: worker.email,
        job: worker.role,
      },
      role: "admin",
    });

    res.status(200).json({ message: "Worker restored successfully" });
  } catch (error) {
    next(error);
  }
};

export const getArchivedWorkers = async (req, res, next) => {
  try {
    const workers = await User.find({
      role: { $nin: ["admin", "customer"] },
      isArchived: true,
    }).sort({ updatedAt: -1 });

    res.status(200).json(workers);
  } catch (error) {
    next(error);
  }
};

export const getSingleUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const singleUser = await User.findById(userId).populate({
      path: "address",
      select: "fullAddress isActive",
    });

    if (!singleUser) return next(handleMakeError(400, "no user found!"));

    res.status(200).json(singleUser);
  } catch (error) {
    next(error);
  }
};

export const editWorker = async (req, res, next) => {
  const { workerId } = req.params;
  const { email, username, password, role, jobDescription } = req.body;
  const userId = req.user.id;

  /* 
    VALIDATION REFACTOR NOTE:
    Manual validations for email, username, and password have been removed.
    These are now handled by Zod middleware in routes/user.route.js
  */

  const userExists = await User.findOne({ email, _id: { $ne: workerId } });
  if (userExists) {
    return next(handleMakeError(400, "User already exists"));
  }

  try {
    let hashedPassword;
    if (password) {
      hashedPassword = await bcypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      workerId,
      {
        email,
        username,
        password: hashedPassword,
        role,
        jobDescription,
      },
      {
        new: true,
      }
    );

    if (!user) return next(handleMakeError(400, "worker not found!"));

    await logAuditTrail({
      action: "admin_edit_worker",
      userId,
      targetId: user._id,
      targetType: "EditWorker",
      details: {
        email,
        job: role,
        jobDescription,
      },
      role: "admin",
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const adminUpdateUserStatus = async (req, res, next) => {
  const { customerId } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  try {
    const validStatuses = ["active", "blocked"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const user = await User.findByIdAndUpdate(
      customerId,
      {
        status,
      },
      { new: true, runValidators: true }
    );

    if (!user) return next(handleMakeError(400, "user not found!"));

    if (status === "blocked") {
      await Address.deleteMany({ userId: user._id });
      await Review.deleteMany({ userId: user._id });

      await logAuditTrail({
        action: "admin_blocked_user",
        userId,
        targetId: user._id,
        targetType: "User",
        details: {
          description: "User blocked a user",
        },
        role: "admin",
      });
    }

    if (status === "active") {
      await logAuditTrail({
        action: "admin_set_to_active_a_user",
        userId,
        targetId: user._id,
        targetType: "User",
        details: {
          description: "User blocked a user",
        },
        role: "admin",
      })}
    res.status(200).json(user);
  } catch (error){
    next(error);
  }
}


export const checkIfAdminExists = async (req, res, next) => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      res.status(200).json({ hasAdmin: true });
    } else {
      res.status(200).json({ hasAdmin: false });
    }
  } catch (error) {
    next(error);
  }
};

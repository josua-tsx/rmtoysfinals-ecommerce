import { handleMakeError } from "../middleware/handleError.js";
import User from "../models/user.models.js";
import bcypt from "bcryptjs";
import { generateTokens } from "../utils/generateToken.js";
import { logAuditTrail } from "./audit.controller.js";

import Address from "../models/address.models.js";
import Rider from "../models/rider.models.js";
import Supplier from "../models/supplier.model.js";
import Review from "../models/review.model.js";

import Subscribe from "../models/subscribe.model.js";

export const updateProfile = async (req, res, next) => {
  const id = req.params.id;
  const { username, email, password, avatar, phoneNumber, fullName } = req.body;

  const user = await User.findById(id);

  if (!user) return next(handleMakeError(400, "No user found!"));

  let isEmailChanged = false;
  let isPhoneChanged = false;
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

  // Detect phone number change
  if (phoneNumber !== undefined && phoneNumber !== user.phoneNumber) {
    isPhoneChanged = true;
  }

  // Check for duplicate phone number across User, Rider, and Supplier collections
  if (phoneNumber !== undefined) {
    const [phoneExistsInUser, phoneExistsInRider, phoneExistsInSupplier] = await Promise.all([
      User.findOne({ phoneNumber, _id: { $ne: id } }),
      Rider.findOne({ riderPhoneNumber: phoneNumber }),
      Supplier.findOne({ contactNumber: phoneNumber })
    ]);

    if (phoneExistsInUser) {
      return next(handleMakeError(400, "Phone number is already in use by another account"));
    }
    if (phoneExistsInRider) {
      return next(handleMakeError(400, "Phone number is already in use by another account"));
    }
    if (phoneExistsInSupplier) {
      return next(handleMakeError(400, "Phone number is already in use by another account"));
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

    // Reset phone verification if phone number changed
    if (isPhoneChanged) {
      updateData.isPhoneVerified = false;
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
    const { 
      page = 1, 
      limit = 10, 
      search 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { role: "customer" };

    if (search) {
      const searchRegex = new RegExp(search, "i");
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);

      if (isObjectId) {
        query.$or = [
          { email: searchRegex },
          { username: searchRegex },
          { status: searchRegex },
          { _id: search }
        ];
      } else {
        query.$or = [
          { email: searchRegex },
          { username: searchRegex },
          { status: searchRegex }
        ];
      }
    }

    const findAllCustomer = await User.find(query)
      .populate({
        path: "address",
        select: "fullAddress isActive",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await User.countDocuments(query);

    res.status(200).json({
      users: findAllCustomer,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllWorkers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {
      role: { $nin: ["admin", "customer"] },
      isArchived: { $ne: true },
    };

    if (search) {
      const searchRegex = new RegExp(search, "i");
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);

      if (isObjectId) {
         query.$or = [
          { email: searchRegex },
          { username: searchRegex },
          { role: searchRegex },
          { jobDescription: searchRegex },
          { _id: search }
        ];
      } else {
        query.$or = [
          { email: searchRegex },
          { username: searchRegex },
          { role: searchRegex },
          { jobDescription: searchRegex }
        ];
      }
    }

    const workers = await User.find(query)
      .populate({
        path: "address",
        select: "fullAddress isActive",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await User.countDocuments(query);

    res.status(200).json({
      workers,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
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
    const { 
      page = 1, 
      limit = 10,
      search = ""
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const searchFilter = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { fullName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const query = {
      role: { $nin: ["admin", "customer"] },
      isArchived: true,
      ...searchFilter,
    };

    const workers = await User.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await User.countDocuments(query);

    res.status(200).json({
      workers,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
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

/**
 * Complete user onboarding
 * Collects fullName, phoneNumber, and shipping address after signup
 */
export const completeOnboarding = async (req, res, next) => {
  const userId = req.user._id;
  const { fullName, phoneNumber, address } = req.body;

  try {
    // Check if already onboarded
    const existingUser = await User.findById(userId);
    if (existingUser.isOnboardingComplete) {
      return next(handleMakeError(400, "Onboarding already completed"));
    }

    // Check for duplicate phone number across User, Rider, and Supplier collections
    const [phoneExistsInUser, phoneExistsInRider, phoneExistsInSupplier] = await Promise.all([
      User.findOne({ 
        phoneNumber, 
        _id: { $ne: userId } // Exclude current user
      }),
      Rider.findOne({ riderPhoneNumber: phoneNumber }),
      Supplier.findOne({ contactNumber: phoneNumber })
    ]);

    if (phoneExistsInUser) {
      return next(handleMakeError(400, "Phone number is already in use by another account"));
    }
    if (phoneExistsInRider) {
      return next(handleMakeError(400, "Phone number is already in use by another account"));
    }
    if (phoneExistsInSupplier) {
      return next(handleMakeError(400, "Phone number is already in use by another account"));
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        phoneNumber,
        isOnboardingComplete: true,
      },
      { new: true }
    );

    // Create shipping address if provided
    if (address) {
      const { region, stateProvince, city, barangay, streetBuildingHouseNum } = address;
      
      const fullAddress = `${streetBuildingHouseNum}, ${barangay}, ${city}, ${stateProvince}, ${region}, Philippines`;
      
      const newAddress = new Address({
        userId,
        region,
        stateProvince,
        city,
        barangay,
        streetBuildingHouseNum,
        fullAddress,
        isActive: true, // Set as default address
      });

      await newAddress.save();

      // Add address reference to user
      await User.findByIdAndUpdate(userId, {
        $push: { address: newAddress._id },
      });
    }

    await logAuditTrail({
      action: "onboarding_completed",
      userId: userId,
      targetId: userId,
      targetType: "User",
      details: {
        description: "User completed onboarding",
      },
      role: updatedUser.role,
    });

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      user: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber,
        isOnboardingComplete: updatedUser.isOnboardingComplete,
      },
    });
  } catch (error) {
    next(error);
  }
};

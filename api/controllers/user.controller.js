import { handleMakeError } from "../middleware/handleError.js";
import User from "../models/user.models.js";
import bcypt from "bcryptjs";
import { generateTokens } from "../utils/generateToken.js";
import { logAuditTrail } from "./audit.controller.js";

import Address from "../models/address.models.js";
import Review from "../models/review.model.js";
import {
  validateEmail,
  validateFullName,
  validatePassword,
  validatePHMobile,
  validateUsername,
} from "../utils/validations.js";
import { sendEmail } from "../nodemailer/nodemailer.js";

const emailVerificationAttempts = new Map();

export const verifyUserEmail = async (req, res, next) => {
  const { email } = req.body;

  const lastAttempt = emailVerificationAttempts.get(email);

  if (lastAttempt) {
    const coolDown = 5 * 60 * 1000; // 5 minutes
    const timeSinceLastAttempt = Date.now() - lastAttempt;

    if (timeSinceLastAttempt < coolDown) {
      const timeLeftMinutes = Math.ceil(
        (coolDown - timeSinceLastAttempt) / (1000 * 60)
      );
      return next(
        handleMakeError(
          400,
          `Please wait ${timeLeftMinutes} minute(s) before requesting another reset.`
        )
      );
    }
  }

  emailVerificationAttempts.set(email, Date.now());

  const validUser = await User.findOne({ email });

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15   hours from now

  // Update user with verification token
  validUser.resetToken = verificationToken;
  validUser.resetTokenExpiry = verificationExpires;

  // Save the validUser (assuming 'validUser' is the document you're updating)
  await validUser.save();

  // Send verification email
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  try {
    await sendEmail({
      to: email,
      subject: "Verify Your Email Address",
      html: `
          <p>Please click the following link to verify your email:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>This link will expire in 24 hours.</p>
        `,
    });

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

export const updateProfile = async (req, res, next) => {
  const id = req.params.id;
  const { username, email, password, avatar, phoneNumber, fullName } = req.body;

  const user = await User.findById(id);

  if (!user) return next(handleMakeError(400, "No user found!"));

  // Validate fields if they exist
  if (username !== undefined) {
    if (!username.trim()) {
      return next(handleMakeError(400, "Username cannot be empty!"));
    }
    const userNameCheck = validateUsername(username);
    if (!userNameCheck.valid) {
      return next(handleMakeError(400, userNameCheck.message));
    }
    const usernameExist = await User.findOne({ username, _id: { $ne: id } });
    if (usernameExist) {
      return next(handleMakeError(400, "Username already exists"));
    }
  }

  if (email !== undefined) {
    if (!email.trim()) {
      return next(handleMakeError(400, "Email cannot be empty!"));
    }
    const userEmailCheck = validateEmail(email);
    if (!userEmailCheck.valid) {
      return next(handleMakeError(400, userEmailCheck.message));
    }
    const userExists = await User.findOne({ email, _id: { $ne: id } });
    if (userExists) {
      return next(handleMakeError(400, "Email already exists"));
    }
  }

  if (fullName !== undefined && fullName) {
    const fullNameCheck = validateFullName(fullName);
    if (!fullNameCheck.valid) {
      return next(handleMakeError(400, fullNameCheck.message));
    }
  }

  if (phoneNumber !== undefined && phoneNumber) {
    const phoneNumberCheck = validatePHMobile(phoneNumber);
    if (!phoneNumberCheck.valid) {
      return next(handleMakeError(400, phoneNumberCheck.message));
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

    const currentUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          username,
          email,
          password: hashedPassword,
          avatar,
          phoneNumber,
          fullName,
        },
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
      role: { $ne: "customer" },
      _id: { $ne: "674a8b6e31d97896a7d5e9e2" },
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

    await User.findByIdAndDelete(workerId);

    await logAuditTrail({
      action: "admin_delete_worker",
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

    res.status(200).json({ message: "Worker Deleted" });
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

  if (!role) {
    return next(handleMakeError(400, "Please select role"));
  }

  if (!jobDescription) {
    return next(handleMakeError(400, "Please input job description"));
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
      });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

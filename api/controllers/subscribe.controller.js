import mongoose from "mongoose";
import { handleMakeError } from "../middleware/handleError.js";
import Subscribe from "../models/subscribe.model.js";
import User from "../models/user.models.js";

export const toggleSubscription = async (req, res, next) => {
  const userId = req.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);

    if (!user) {
      await session.endSession();
      return next(handleMakeError(400, "User is not found!"));
    }

    // If currently subscribed → unsubscribe
    if (user.isSubscribed) {
      await Subscribe.findOneAndDelete({ userId }).session(session);

      user.isSubscribed = false;
      await user.save({ session });

      await session.commitTransaction();
      return res.status(200).json({ message: "Unsubscribed successfully!" });
    }

    // If not subscribed → subscribe
    if (!user.isEmailVerified) {
      await session.endSession();
      return next(
        handleMakeError(
          400,
          "You should verify your email first before subscribing."
        )
      );
    }

    const newSubscription = new Subscribe({
      subscribedEmail: user.email,
      userId: user._id,
    });

    user.isSubscribed = true;

    await newSubscription.save({ session });
    await user.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      message: "Subscribed successfully!",
      emailSubscribed: newSubscription.subscribedEmail,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getSubscribedEmails = async (req, res, next) => {
  try {
    const getAllSubscribedEmails = await Subscribe.find();
  
    if (!getAllSubscribedEmails || getAllSubscribedEmails.length === 0) {
      return next(handleMakeError(404, "No subscribed emails found."));
    }

    res.status(200).json({
      message: "Emails received!",
      subscribedEmails: getAllSubscribedEmails,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubscribedUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { isSubscribed: true };

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { email: searchRegex },
        { username: searchRegex },
        { fullName: searchRegex },
      ];
    }

    const subscribers = await User.find(query)
      .select("username email fullName avatar isSubscribed createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await User.countDocuments(query);

    res.status(200).json({
      users: subscribers,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      hasMore: totalCount > pageNum * limitNum,
    });
  } catch (error) {
    next(error);
  }
};
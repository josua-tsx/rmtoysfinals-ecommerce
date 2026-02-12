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
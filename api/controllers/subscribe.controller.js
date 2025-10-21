import mongoose from "mongoose";
import { handleMakeError } from "../middleware/handleError.js";
import Subscribe from "../models/subscribe.model.js";
import User from "../models/user.models.js";

export const subscribeEmail = async (req, res, next) => {
  const userId = req.user.id;

  const session = await mongoose.startSession(); // 1. Start a session
  session.startTransaction(); // 2. Start a transaction

  try {
    const user = await User.findById(userId).session(session); // 3. Pass session to queries

    if (!user) {
      // No need to abort, just return error
      await session.endSession();
      return next(handleMakeError(400, "User is not found!"));
    }

    if (user.isSubscribed) {
      await session.endSession();
      return next(
        handleMakeError(
          400,
          "You already have subscribed! You can only subscribe one email per account."
        )
      );
    }

    if (user.isEmailVerified === false) {
      await session.endSession();
      return next(
        handleMakeError(
          400,
          "You should verify your email first before subscribing."
        )
      );
    }

    const newSubscription = new Subscribe({
      // 🔽 Use the user's email directly
      subscribedEmail: user.email, 
      userId: user._id,
    });

    user.isSubscribed = true;

    // Run saves within the transaction
    await newSubscription.save({ session }); // 3. Pass session to save
    await user.save({ session }); // 3. Pass session to save

    await session.commitTransaction(); // 4. Commit if both succeed

    res.status(200).json({
      message: "Email Subscribed Successfully!",
      emailSubscribed: newSubscription.subscribedEmail,
    });
  } catch (error) {
    await session.abortTransaction(); // 5. Rollback if anything fails
    next(error);
  } finally {
    session.endSession(); // 6. Always end the session
  }
};

export const getSubscribedEmails = async (req, res, next) => {
  try {
    const getAllSubscribedEmails = await Subscribe.find();
  
    if (!getAllSubscribedEmails || getAllSubscribedEmails.length === 0) {
      return next(handleMakeError(404, "No subscribed emails found.")); // 404 is better
    }

    res.status(200).json({
      message: "Emails received!",
      subscribedEmails: getAllSubscribedEmails,
    });
  } catch (error) {
    next(error);
  }
};

export const unsubscribeEmail = async (req, res, next) => {
  const userId = req.user.id;
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the subscription document
    const subscribedUser = await Subscribe.findOne({ userId }).session(session);
    
    if (!subscribedUser) {
      await session.endSession();
      return next(handleMakeError(404, "Subscription not found!"));
    }

    // Perform operations in parallel within the transaction
    const [deleteResult, updatedUser] = await Promise.all([
      Subscribe.findByIdAndDelete(subscribedUser._id).session(session),
      User.findByIdAndUpdate(
        userId,
        { $set: { isSubscribed: false } },
        { new: true, session } // Pass session here
      )
    ]);

    await session.commitTransaction(); // Commit both

    res.status(200).json({
      message: "Unsubscribed successfully!",
      subscribedId: deleteResult, // Changed 'succesfull' to 'successfully'
      user: updatedUser,
    });
  } catch (error) {
    await session.abortTransaction(); // Rollback if either fails
    next(error);
  } finally {
    session.endSession();
  }
};
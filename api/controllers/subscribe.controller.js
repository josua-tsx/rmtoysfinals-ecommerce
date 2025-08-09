import { handleMakeError } from "../middleware/handleError.js";
import Subscribe from "../models/subscribe.model.js";
import User from "../models/user.models.js";

export const subscribeEmail = async (req, res, next) => {
  const { subscribedEmail } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(handleMakeError(400, "User is not found!"));
    }

    if (user.isSubscribed) {
      return next(
        handleMakeError(
          400,
          "You already have subscribed! You can only subscribe one email per account."
        )
      );
    }

    const newSubscription = new Subscribe({
      subscribedEmail,
      userId: user._id,
    });

    user.isSubscribed = true;

    // SAVE THEM SIMULTANEOUSLY
    await Promise.all([newSubscription.save(), user.save()]);

    res.status(200).json({
      message: "Email Subscribed Successfully!",
      emailSubscribed: newSubscription.subscribedEmail,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscribedEmails = async (req, res, next) => {
  try {
    const getAllSubscribedEmails = await Subscribe.find();
    if (!getAllSubscribedEmails)
      return next(handleMakeError(400, "No subscribed emails found."));
    res.status(200).json({
      message: "Emails received!",
      subscribedEmails: getAllSubscribedEmails,
    });
  } catch (error) {
    next(error);
  }
};

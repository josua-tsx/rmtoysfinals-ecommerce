import Notification from "../models/notifications.model.js";

export const logNotification = async ({
  notificationType,
  notificationDetails,
  userId,
  targetId,
}) => {
  try {
    const notificationEntry = new Notification({
      notificationType,
      notificationDetails,
      userId,
      targetId,
    });

    await notificationEntry.save();
  } catch (error) {
    console.log(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    if (notifications.length === 0) return res.status(200).json([]);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const deleteAllNotification = async (req, res, next) => {
  try {
    await Notification.deleteMany({});

    res.status(200).json({ message: "All notifications deleted successfully" });
  } catch (error) {
    next(error); // Pass the error to the next middleware/error handler
  }
};

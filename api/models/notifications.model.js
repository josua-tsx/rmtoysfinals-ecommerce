import mongoose from "mongoose";

const NotificationSchemaModel = mongoose.Schema({
  notificationType: {
    type: String,
    required: true,
  },
  notificationDetails: {
    type: Object
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User performing the action
  targetId: { type: mongoose.Schema.Types.ObjectId }, // e.g., ID of the product/order involved
  timestamp: { type: Date, default: Date.now }, // Auto-generated timestamp
});

const Notification = mongoose.model("Notification", NotificationSchemaModel);

export default Notification;

import mongoose from "mongoose";

const AuditSchemaModel = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'create_product', 'update_order', 'login'
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User performing the action
  targetId: { type: mongoose.Schema.Types.ObjectId }, // e.g., ID of the product/order involved
  targetType: { type: String }, // e.g., 'Product', 'Order', 'User'
  details: { type: Object }, // Store additional details about the action
  role: { type: String, enum: ["customer", "admin"] },
  timestamp: { type: Date, default: Date.now }, // Auto-generated timestamp
});

const Audit = mongoose.model("Audit", AuditSchemaModel);

export default Audit;

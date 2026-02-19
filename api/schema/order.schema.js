import {z} from "zod"

import { emailSchema, phMobileSchema } from "../utils/validations.js";
import mongoose from "mongoose";


const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

const orderItemSchema = z.object({
  productId: z.union([objectIdSchema, z.object({ _id: objectIdSchema }).passthrough()]),
  productName: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").max(5, "Maximum 5 items per product allowed"),
  productImages: z.union([z.string(), z.array(z.string())]).optional(),
});

export const placeOrderSchema = z.object({
  body: z.object({
    orderItems: z.array(orderItemSchema).min(1, "Order must contain products"),
    shippingAddress: z.string({ required_error: "Shipping address is required" }).trim().min(5, "Address must be at least 5 characters").max(500, "Address cannot exceed 500 characters"),
    paymentMethod: z.enum(["Cod", "Online Payment", "GcashQR"]),
    shippingPrice: z.coerce.number().nonnegative().default(0),
    subtotal: z.coerce.number().nonnegative(),
    totalPrice: z.coerce.number().nonnegative(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
    totalPoints: z.coerce.number().nonnegative().optional().default(0),
    usedCredits: z.coerce.number().nonnegative().optional().default(0),
    vatableSalesNet: z.coerce.number().optional().default(0),
    vatExemptSales: z.coerce.number().optional().default(0),
    totalVatAmount: z.coerce.number().optional().default(0),
    gcashQRmethod: z.object({
      gcashPhoneNumber: phMobileSchema.optional(),
      proofOfPaymentImage: z.string().optional(),
      gcashName: z.string().min(3, "Name must be at least 3 characters").max(100, "Name cannot exceed 100 characters").optional(),
    }).optional(),
    guestUser: z.object({
      name: z.string().min(2).max(100, "Name cannot exceed 100 characters"),
      phone: phMobileSchema,
      email: emailSchema,
    }).optional(),
  }).superRefine((data, ctx) => {
    if (data.paymentMethod === "GcashQR") {
      if (!data.gcashQRmethod?.gcashPhoneNumber || !data.gcashQRmethod?.proofOfPaymentImage || !data.gcashQRmethod?.gcashName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "GCash QR payment requires phone number, name, and proof of payment",
          path: ["gcashQRmethod"],
        });
      }
    }
    // Guest User Validation
    if (!data.userId && !data.guestUser && !data.isGuest) { 
        // Note: isGuest might not be in body payload explicitly if inferred from token, 
        // but let's assume if no token (handled by auth middleware) we might need guest details?
        // Actually auth middleware handles req.user. 
        // The schema validates the BODY. 
        // If the controller logic relies on req.user to decide if guestUser is needed, 
        // Zod might not know about req.user. 
        // So we might need to keep guestUser check in controller OR pass context to Zod (harder here).
        // For now, let's leave unconditional guestUser check to controller or make it optional in Zod 
        // and rely on controller to enforce "if not logged in, must have guestUser".
    }
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: objectIdSchema,
  }),
  body: z.object({
    status: z.enum(["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"], {
        required_error: "Status is required"
    }),
    isGuest: z.boolean().optional(),
    riderId: objectIdSchema.nullable().optional(),
  }).superRefine((data, ctx) => {
    if (data.status === "Shipped" && !data.riderId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must pick a rider to update status to shipped",
        path: ["riderId"],
      });
    }
  }),
});

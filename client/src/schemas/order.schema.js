import { z } from "zod";
import { phMobileSchema, emailSchema } from "./common.schema.js";

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is missing"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").max(5, "Maximum 5 items per product allowed"),
});

export const placeOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, "Order must contain products"),
  shippingAddress: z.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address is too long"),
  paymentMethod: z.enum(["Cod", "Online Payment", "GcashQR"]),
  shippingPrice: z.coerce.number().nonnegative().default(0),
  subtotal: z.coerce.number().nonnegative(),
  totalPrice: z.coerce.number().nonnegative(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  
  // Optional fields for credits/points
  totalPoints: z.coerce.number().nonnegative().optional().default(0),
  usedCredits: z.coerce.number().nonnegative().optional().default(0),

  // GCash QR specific fields
  gcashQRmethod: z.object({
    gcashPhoneNumber: phMobileSchema.optional(),
    proofOfPaymentImage: z.string().optional(),
    gcashName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long").optional(),
  }).optional(),

  // Guest User specific fields
  guestUser: z.object({
    name: z.string().min(2, "Name is required").max(100, "Name is too long"),
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
});

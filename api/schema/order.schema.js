import { z } from "zod";
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
    shippingAddress: z.string({ required_error: "Shipping address is required" }).trim().min(5, "Address must be at least 5 characters"),
    paymentMethod: z.enum(["Cash on Delivery", "Online Payment", "GcashQR"]),
    shippingPrice: z.coerce.number().nonnegative().default(0),
    subtotal: z.coerce.number().nonnegative(),
    totalPrice: z.coerce.number().nonnegative(),
    notes: z.string().optional(),
    totalPoints: z.coerce.number().nonnegative().optional().default(0),
    usedCredits: z.coerce.number().nonnegative().optional().default(0),
    vatableSalesNet: z.coerce.number().optional().default(0),
    vatExemptSales: z.coerce.number().optional().default(0),
    totalVatAmount: z.coerce.number().optional().default(0),
    gcashQRmethod: z.object({
      gcashPhoneNumber: z.string().optional(),
      proofOfPaymentImage: z.string().optional(),
      gcashName: z.string().optional(),
    }).optional(),
    guestUser: z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string().email(),
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

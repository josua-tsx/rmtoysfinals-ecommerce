import { z } from "zod";

const phMobileRegex = /^(09\d{9}|(\+639)\d{9})$/;

export const createTicketSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").max(100, "Email is too long"),
  phone: z
    .string()
    .regex(phMobileRegex, "Invalid PH mobile number (e.g. 09xxxxxxxxx)")
    .optional()
    .or(z.literal("")),
  orderNumber: z.string().max(50, "Order number is too long").optional().or(z.literal("")),
  subject: z.string().min(1, "Subject is required").max(100, "Subject is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message is too long"),
  issueType: z.enum(
    [
      "Refund Request",
      "Shipping Issue",
      "Product Inquiry",
      "Damaged Product",
      "Order Cancellation",
      "Other",
    ],
    {
      message: "Please select an issue type",
    }
  ),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  images: z.array(z.string()).optional(),
});

export const replyTicketSchema = z.object({
  message: z.string().min(1, "Message is required").max(1000, "Message is too long"),
  images: z.array(z.string()).optional(),
});

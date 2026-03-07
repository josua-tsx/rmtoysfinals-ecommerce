import { z } from "zod";
import mongoose from "mongoose";
import { emailSchema, phMobileSchema } from "../utils/validations.js";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

export const createTicketSchema = z.object({
  body: z.object({
    email: emailSchema,
    name: z.string({ required_error: "Name is required" }).trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
    phone: phMobileSchema.optional(),
    orderNumber: z.string().max(50, "Order number too long").optional(),
    issueType: z.enum(
      [
        "Refund Request",
        "Shipping Issue",
        "Product Inquiry",
        "Damaged Product",
        "Order Cancellation",
        "Other",
      ],
      { required_error: "Issue type is required" }
    ),
    subject: z.string({ required_error: "Subject is required" }).trim().min(5, "Subject must be at least 5 characters").max(100, "Subject cannot exceed 100 characters"),
    message: z.string({ required_error: "Message is required" }).trim().min(10, "Message must be at least 10 characters").max(1000, "Message cannot exceed 1000 characters"),
    priority: z.enum(["Low", "Medium", "High"]).optional().default("Medium"),
    images: z.array(z.string()).optional(),
  }),
});

export const replyTicketSchema = z.object({
  params: z.object({
    ticketId: objectIdSchema,
  }),
  body: z.object({
    message: z.string({ required_error: "Message is required" }).trim().min(1, "Message cannot be empty").max(1000, "Message cannot exceed 1000 characters"),
    images: z.array(z.string()).optional(),
  }),
});

export const updateTicketStatusSchema = z.object({
  params: z.object({
    ticketId: objectIdSchema,
  }),
  body: z.object({
    status: z.enum(["Pending", "In Progress", "Awaiting Confirmation", "Resolved", "Closed"]).optional(),
    priority: z.enum(["Low", "Medium", "High"]).optional(),
  }).refine((data) => data.status || data.priority, {
    message: "At least one field (status or priority) must be provided",
  }),
});

export const assignTicketSchema = z.object({
    params: z.object({
        ticketId: objectIdSchema,
    }),
    body: z.object({
        adminId: objectIdSchema,
    }),
});

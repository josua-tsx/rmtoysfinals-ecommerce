import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

export const addToCartSchema = z.object({
  body: z.object({
    productId: objectIdSchema,
  }),
});

export const updateCartSelectionSchema = z.object({
  params: z.object({
    productId: objectIdSchema,
  }),
  body: z.object({
    isSelected: z.boolean({ required_error: "isSelected is required" }),
  }),
});

export const updateCartQuantitySchema = z.object({
  body: z.object({
    productId: objectIdSchema,
    quantity: z.number({ required_error: "Quantity is required" })
      .int("Quantity must be an integer")
      .nonnegative("Quantity must be non-negative"),
  }),
});

export const deleteCartSchema = z.object({
  body: z.object({
    productId: objectIdSchema,
  }),
});

export const deleteMultiCartSchema = z.object({
    body: z.object({
        cartIds: z.array(objectIdSchema).min(1, "At least one cart ID is required"),
    }),
});

import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

export const createCategorySchema = z.object({
  body: z.object({
    categoryName: z
      .string({ required_error: "Please input category name" })
      .trim()
      .min(3, "Category name must be 3-50 characters long")
      .max(50, "Category name must be 3-50 characters long")
      .regex(/^[A-Za-z0-9]+(?:\s[A-Za-z0-9]+)*$/, "Category name must contain only letters, numbers and single spaces between words"),
    categoryDescription: z
      .string({ required_error: "Please input category description" })
      .trim()
      .max(200, "Description cannot exceed 200 characters")
      .regex(/^[A-Za-z0-9\s.,!?-]+$/, "Description contains invalid characters"),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    categoryId: objectIdSchema,
  }),
  body: createCategorySchema.shape.body.partial(),
});

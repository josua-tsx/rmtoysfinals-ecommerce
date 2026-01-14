import { z } from "zod";

export const categoryNameSchema = z
  .string({ required_error: "Please input category name" })
  .trim()
  .min(3, "Category name must be 3-50 characters long")
  .max(50, "Category name must be 3-50 characters long")
  .regex(
    /^[A-Za-z0-9]+(?:\s[A-Za-z0-9]+)*$/,
    "Category name must contain only letters, numbers and single spaces between words"
  );

export const categoryDescriptionSchema = z
  .string({ required_error: "Please input category description" })
  .trim()
  .max(200, "Description cannot exceed 200 characters")
  .regex(
    /^[A-Za-z0-9\s.,!?-]+$/,
    "Description contains invalid characters"
  )
  .optional()
  .or(z.literal(""));

export const createCategorySchema = z.object({
  categoryName: categoryNameSchema,
  categoryDescription: categoryDescriptionSchema,
});

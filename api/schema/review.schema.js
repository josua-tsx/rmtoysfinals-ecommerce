import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

export const addReviewSchema = z.object({
  params: z.object({
    productId: objectIdSchema,
  }),
  body: z.object({
    rating: z.coerce.number()
      .min(0, "Rating must be between 0 and 5")
      .max(5, "Rating must be between 0 and 5"),
    commentReview: z.string().optional().refine((val) => {
        if (!val) return true; // allow empty if optional
        return val.trim().length >= 1 && val.trim().length <= 500;
    }, "Comment must be 1-500 characters long"),
  }),
});

export const editReviewSchema = z.object({
  params: z.object({
    reviewId: objectIdSchema,
  }),
  body: z.object({
    rating: z.coerce.number()
      .min(0, "Rating must be between 0 and 5")
      .max(5, "Rating must be between 0 and 5")
      .optional(),
    commentReview: z.string().optional().refine((val) => {
        if (!val) return true;
        return val.trim().length >= 1 && val.trim().length <= 500;
    }, "Comment must be 1-500 characters long"),
  }),
});

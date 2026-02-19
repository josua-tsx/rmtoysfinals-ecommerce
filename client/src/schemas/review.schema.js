import { z } from "zod";

export const addReviewSchema = z.object({
  rating: z.coerce.number().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().max(500, "Review comment cannot exceed 500 characters").optional(),
  images: z.array(z.string()).optional(),
});

export const editReviewSchema = z.object({
  rating: z.coerce.number().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().max(500, "Review comment cannot exceed 500 characters").optional(),
});

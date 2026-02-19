import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").max(5, "Maximum 5 items allowed"),
});

export const updateCartQuantitySchema = z.object({
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").max(5, "Maximum 5 items allowed"),
});

export const updateCartSelectSchema = z.object({
  isSelected: z.boolean(),
});

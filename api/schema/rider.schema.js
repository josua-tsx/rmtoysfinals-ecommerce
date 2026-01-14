import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

import { fullNameSchema, phMobileSchema } from "../utils/validations.js";

export const riderSchema = z.object({
  body: z.object({
    riderName: fullNameSchema,
    riderPhoneNumber: phMobileSchema,
  }),
});

export const deleteMultiRiderSchema = z.object({
  body: z.object({
    riderIds: z.array(objectIdSchema).min(1, "Rider IDS should be an array"),
  }),
});

export const editRiderSchema = z.object({
  params: z.object({
    riderId: objectIdSchema,
  }),
  body: z.object({
    riderName: fullNameSchema,
    riderPhoneNumber: phMobileSchema,
  }),
});

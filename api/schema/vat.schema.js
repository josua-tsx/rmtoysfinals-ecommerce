import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

export const addVatSchema = z.object({
  body: z.object({
    vatPercent: z.coerce.number({ required_error: "VAT Percent is required" })
        .nonnegative("VAT percent cannot be negative")
        .max(10000, "VAT percent cannot exceed 10000"),
    vatValue: z.number().optional(), // Is this used? Controller logic mainly checks percent
  }),
});

export const editVatSchema = z.object({
  params: z.object({
    vatId: objectIdSchema,
  }),
  body: z.object({
    vatPercent: z.coerce.number({ required_error: "VAT Percent is required" })
        .nonnegative("VAT percent cannot be negative")
        .max(10000, "VAT percent cannot exceed 10000"),
    vatValue: z.number().optional(),
  }),
});

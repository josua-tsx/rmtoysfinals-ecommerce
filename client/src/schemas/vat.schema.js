import { z } from "zod";

export const vatPercentSchema = z.coerce
  .number({ required_error: "VAT percentage is required" })
  .min(0, "VAT percentage cannot be negative")
  .max(100, "VAT percentage cannot exceed 100");

export const vatValueSchema = z.coerce
  .number({ required_error: "VAT value is required" })
  .min(0, "VAT value cannot be negative")
  .max(1, "VAT value cannot exceed 1");

export const vatSchema = z.object({
  vatPercent: vatPercentSchema,
  vatValue: vatValueSchema,
});

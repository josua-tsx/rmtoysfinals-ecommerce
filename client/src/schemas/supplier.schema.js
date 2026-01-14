import { z } from "zod";
import { phMobileSchema, fullNameSchema } from "./common.schema";

export const supplierNameSchema = z
  .string({ required_error: "Supplier name is required" })
  .trim()
  .min(3, "Supplier name must be 3-50 characters long")
  .max(50, "Supplier name must be 3-50 characters long")
  .regex(
    /^[A-Za-z0-9\s\-',.&()]+$/,
    "Supplier name contains invalid characters"
  );

export const supplierAddressSchema = z
  .string()
  .trim()
  .min(5, "Address must be 5-200 characters long")
  .max(200, "Address must be 5-200 characters long")
  .regex(/^[A-Za-z0-9\s.,'#-]+$/, "Address contains invalid characters")
  .optional()
  .or(z.literal(""));

export const createSupplierSchema = z.object({
  supplierName: supplierNameSchema,
  contactNumber: phMobileSchema,
  contactPerson: fullNameSchema,
  supplierAddress: supplierAddressSchema,
});

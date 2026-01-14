import { z } from "zod";
import mongoose from "mongoose";

import { phMobileSchema, fullNameSchema } from "../utils/validations.js";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

export const createSupplierSchema = z.object({
  body: z.object({
    supplierName: z
      .string({ required_error: "Supplier name is required" })
      .trim()
      .min(3, "Supplier name must be 3-50 characters long")
      .max(50, "Supplier name must be 3-50 characters long")
      .regex(/^[A-Za-z0-9\s\-',.&()]+$/, "Supplier name contains invalid characters")
      .refine((val) => !/^[-']|[-']$/.test(val), "Supplier name cannot start or end with hyphens/apostrophes"),
    contactNumber: phMobileSchema,
    contactPerson: fullNameSchema,
    supplierAddress: z
      .string()
      .trim()
      .min(5, "Address must be 5-200 characters long")
      .max(200, "Address must be 5-200 characters long")
      .regex(/^[A-Za-z0-9\s.,'#-]+$/, "Address contains invalid characters")
      .optional(),
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({
    supplierId: objectIdSchema,
  }),
  body: createSupplierSchema.shape.body.partial(),
});

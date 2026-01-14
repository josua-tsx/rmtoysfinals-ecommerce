import { z } from "zod";
import mongoose from "mongoose";

// Regex patterns (ported from manual validations.js)
const PRODUCT_NAME_REGEX = /^[a-zA-Z0-9 \-']+$/;
const PRODUCT_NAME_NO_NUMBER_START_REGEX = /^[^0-9]/;
const PRODUCT_NAME_NO_HYPHEN_APOSTROPHE_ENDS_REGEX = /^[^-'][a-zA-Z0-9 \-']*[^-']$/;

/**
 * Helper to validate MongoDB ObjectId
 */
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

/**
 * Product Payload Schema
 * Matches the validation logic in addProduct/editProduct
 */
const productPayload = {
  body: z.object({
    productName: z
      .string({ required_error: "Please input product name" })
      .min(5, "Product name must be 5-50 characters")
      .max(50, "Product name must be 5-50 characters")
      .trim()
      .regex(PRODUCT_NAME_REGEX, "Only letters, numbers, spaces, hyphens (-), and apostrophes (') are allowed")
      .regex(PRODUCT_NAME_NO_NUMBER_START_REGEX, "Product name cannot start with a number")
      // The manual validation for "start/end with hyphen" is covered partially by regex above but let's be explicit if needed
      .refine(
        (val) => !val.startsWith("-") && !val.startsWith("'") && !val.endsWith("-") && !val.endsWith("'"),
        "Product name cannot start or end with a hyphen (-) or apostrophe (')"
      ),
      
    productDescription: z
      .string({ required_error: "Please input product description" })
      .trim()
      .min(1, "Please input product description")
      .max(200, "Description cannot exceed 200 characters"),
      
    category: objectIdSchema, // Expecting a valid MongoDB ID
    
    productImages: z
      .array(z.string())
      .min(1, "At least one product image is required"),
      
    points: z.coerce.number().optional().default(0),
    
    taxStatus: z.enum(["vatable", "exempt"]).optional().default("exempt"),
    
    vat: z.string().optional().nullable(),
    
    // Product Details: Max 10 items, must have label & value
    productDetails: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      )
      .max(10, "Maximum 10 product details allowed")
      .optional()
      .default([]),
  }).superRefine((data, ctx) => {
    // Cross-field validation: VAT is required if taxStatus is vatable
    if (data.taxStatus === "vatable" && !data.vat) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "VAT is required for vatable products",
        path: ["vat"],
      });
    }
  }),
};

export const createProductSchema = z.object({
  ...productPayload,
});

export const updateProductSchema = z.object({
  ...productPayload,
  params: z.object({
    id: objectIdSchema,
  }),
  body: productPayload.body.extend({
    price: z.coerce.number({ required_error: "Price is required" }).positive("Price must be greater than 0"),
  }),
});
 
import { z } from "zod";

const PRODUCT_NAME_REGEX = /^[a-zA-Z0-9 \-']+$/;
const PRODUCT_NAME_NO_NUMBER_START_REGEX = /^[^0-9]/;

export const productNameSchema = z
  .string({ required_error: "Please input product name" })
  .min(5, "Product name must be 5-50 characters")
  .max(50, "Product name must be 5-50 characters")
  .trim()
  .regex(PRODUCT_NAME_REGEX, "Only letters, numbers, spaces, hyphens (-), and apostrophes (') are allowed")
  .regex(PRODUCT_NAME_NO_NUMBER_START_REGEX, "Product name cannot start with a number")
  .refine(
    (val) => !val.startsWith("-") && !val.startsWith("'") && !val.endsWith("-") && !val.endsWith("'"),
    "Product name cannot start or end with a hyphen (-) or apostrophe (')"
  );

export const productDescriptionSchema = z
  .string({ required_error: "Please input product description" })
  .trim()
  .min(1, "Please input product description")
  .max(200, "Description cannot exceed 200 characters");

export const createProductSchema = z.object({
  productName: productNameSchema,
  productDescription: productDescriptionSchema,
    
  category: z.string().min(1, "Please select a category"),
  
  productImages: z
    .array(z.string())
    .min(1, "At least one product image is required"),
    
  price: z.coerce.number().positive("Price must be greater than 0").optional(),
    
  points: z.coerce.number().optional().default(0),
  
  taxStatus: z.enum(["vatable", "exempt"]).optional().default("exempt"),
  
  vat: z.string().optional().nullable().or(z.literal("")),
  
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
  if (data.taxStatus === "vatable" && !data.vat) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "VAT is required for vatable products",
      path: ["vat"],
    });
  }
});

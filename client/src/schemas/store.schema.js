import { z } from "zod";
import { emailSchema, phMobileSchema } from "./auth.schema";

export const storeNameSchema = z
  .string({ required_error: "Store name is required" })
  .min(2, "Store name must be at least 2 characters")
  .max(100, "Store name cannot exceed 100 characters");

export const taglineSchema = z
  .string({ required_error: "Tagline is required" })
  .min(2, "Tagline must be at least 2 characters")
  .max(150, "Tagline cannot exceed 150 characters");

export const aboutUsSchema = z
  .string({ required_error: "About Us is required" })
  .min(10, "About Us must be at least 10 characters")
  .max(1000, "About Us cannot exceed 1000 characters");

export const shortTextSchema = z
  .string()
  .min(1, "This field is required")
  .max(100, "Cannot exceed 100 characters");

export const urlSchema = z
  .string()
  .url("Please enter a valid URL")
  .or(z.literal(""))
  .optional();

export const storeInfoSchema = z.object({
  storeName: storeNameSchema,
  tagline: taglineSchema,
  aboutUs: aboutUsSchema,
  ownerName: shortTextSchema,
  ownerStory: z.string().max(1000, "Owner story cannot exceed 1000 characters"),
  contactEmail: emailSchema,
  contactPhone: phMobileSchema,
  address: shortTextSchema,
  businessHours: shortTextSchema,
  shippingPolicy: z
    .string()
    .max(1000, "Shipping policy cannot exceed 1000 characters"),
  returnPolicy: z
    .string()
    .max(1000, "Return policy cannot exceed 1000 characters"),
  paymentMethods: z.array(z.string()).min(1, "At least one payment method is required"),
  customPromptRules: z.array(z.string()).optional(),
  specialResponses: z
    .array(
      z.object({
        trigger: z.string().min(1, "Trigger is required"),
        response: z.string().min(1, "Response is required"),
      })
    )
    .optional(),
  socialMedia: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
  }),
});

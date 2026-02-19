import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

const barangayRegex = /^[a-zA-Z\s'-]{2,100}$/;
const streetRegex = /^[a-zA-Z0-9\s\.,#'-]{5,200}$/;

export const addressSchema = z.object({
  body: z.object({
    country: z.string().optional().default("Philippines"),
    region: z.string({ required_error: "Region is required" }).min(1, "Region is required"),
    stateProvince: z.string({ required_error: "Province is required" }).min(1, "Province is required"),
    city: z.string({ required_error: "City is required" }).min(1, "City is required"),
    
    barangay: z.string({ required_error: "Barangay is required" })
      .trim()
      .regex(barangayRegex, "Invalid barangay format. Use only letters, spaces, hyphens (-), or apostrophes (')"),
      
    streetBuildingHouseNum: z.string({ required_error: "Street address is required" })
      .trim()
      .regex(streetRegex, "Invalid street format. Use only letters, numbers, spaces, or symbols like .,-#"),
      
    fullAddress: z.string().optional(), // Optional since it's often constructed on backend
    isActive: z.boolean().optional().default(false),
  }),
});

export const updateAddressSchema = z.object({
  params: z.object({
    addressId: objectIdSchema,
  }),
  body: addressSchema.body.partial(), // Allow partial updates if needed, though usually address updates are full replace of fields
});

export const updateActiveAddressSchema = z.object({
  body: z.object({
    addressId: objectIdSchema.optional(), // Sometimes passed in body
  }),
});

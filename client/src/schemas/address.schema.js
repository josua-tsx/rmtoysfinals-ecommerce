import { z } from "zod";

export const addressSchema = z.object({
  region: z.string().min(1, "Region is required"),
  stateProvince: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  barangay: z.string()
    .min(2, "Barangay must be at least 2 characters")
    .max(100, "Barangay is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in Barangay"),
  streetBuildingHouseNum: z.string()
    .min(5, "Address details must be at least 5 characters")
    .max(200, "Address details are too long")
    .regex(/^[a-zA-Z0-9\s.,#'-]+$/, "Invalid characters in address details"),
});

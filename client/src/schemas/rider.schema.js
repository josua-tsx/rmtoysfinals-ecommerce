import { z } from "zod";
import { phMobileSchema } from "./common.schema";

export const riderNameSchema = z
  .string({ required_error: "Rider name is required" })
  .min(2, "Rider name must be at least 2 characters")
  .max(100, "Rider name cannot exceed 100 characters");

export const addRiderSchema = z.object({
  riderName: riderNameSchema,
  riderPhoneNumber: phMobileSchema,
});

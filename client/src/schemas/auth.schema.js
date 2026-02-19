import { z } from "zod";
import { emailSchema, usernameSchema, passwordSchema, phMobileSchema } from "./common.schema";

export { emailSchema, usernameSchema, passwordSchema, phMobileSchema };

export const signupSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signinSchema = z.object({
  loginId: z.string().min(1, "Please enter your email or username").trim(),
  password: z.string().min(1, "Please enter your password"),
});

export const forgetPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100, "Full name is too long"),
  phoneNumber: phMobileSchema,
  region: z.string().min(1, "Region is required").max(100, "Region name is too long"),
  stateProvince: z.string().min(1, "Province is required").max(100, "Province name is too long"),
  city: z.string().min(1, "City is required").max(100, "City name is too long"),
  barangay: z.string().min(1, "Barangay is required").max(100, "Barangay name is too long"),
  streetBuildingHouseNum: z.string().min(1, "Street address is required").max(200, "Street address is too long"),
});

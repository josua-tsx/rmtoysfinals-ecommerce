import { z } from "zod";

import { emailSchema, usernameSchema, passwordSchema, phMobileSchema } from "../utils/validations.js";

/**
 * Sign Up Schema
 */
export const signupSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string({ required_error: "Please confirm your password" }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

/**
 * Sign In Schema
 */
export const signinSchema = z.object({
  body: z.object({
    loginId: z.string({ required_error: "Please input email or username" }).trim().min(1, "Please input email or username"),
    password: z.string({ required_error: "Please input password" }).min(1, "Please input password"),
  }),
});

/**
 * Forget Password Schema
 */
export const forgetPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string({ required_error: "Token is required" }),
    newPassword: passwordSchema,
  }),
});

/**
 * Add Worker Schema
 */
export const addWorkerSchema = z.object({
  body: z.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string({ required_error: "Please confirm password" }),
    role: z.enum(["admin", "validatorStaff", "rider", "supplier"], {
      required_error: "Please select role",
    }),
    jobDescription: z.string({ required_error: "Please input job description" }).trim().min(1, "Please input job description").refine((val) => !/\s{2,}/.test(val), "No consecutive spaces allowed"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});
/**
 * Edit Worker Schema
 */
export const editWorkerSchema = z.object({
  params: z.object({
    workerId: z.string().min(1, "Worker ID is required"),
  }),
  body: z.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema.optional().or(z.literal("")),
    role: z.enum(["admin", "validatorStaff", "rider", "supplier"], {
      required_error: "Please select role",
    }),
    jobDescription: z.string({ required_error: "Please input job description" }).trim().min(1, "Please input job description").refine((val) => !/\s{2,}/.test(val), "No consecutive spaces allowed"),
  }),
});
/**
 * Update User Profile Schema
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
  body: z.object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional().or(z.literal("")),
    avatar: z.string().optional(),
    phoneNumber: z.string().optional(),
    fullName: z.string().optional(),
  }),
});

/**
 * Onboarding Schema
 */
export const onboardingSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: "Full name is required" })
      .trim()
      .min(2, "Full name must be at least 2 characters"),
    phoneNumber: phMobileSchema,
    address: z.object({
      region: z.string({ required_error: "Region is required" }).trim().min(1, "Region is required").refine((val) => !/\s{2,}/.test(val), "No consecutive spaces allowed"),
      stateProvince: z.string({ required_error: "State/Province is required" }).trim().min(1, "State/Province is required").refine((val) => !/\s{2,}/.test(val), "No consecutive spaces allowed"),
      city: z.string({ required_error: "City is required" }).trim().min(1, "City is required").refine((val) => !/\s{2,}/.test(val), "No consecutive spaces allowed"),
      barangay: z.string({ required_error: "Barangay is required" }).trim().min(1, "Barangay is required").refine((val) => !/\s{2,}/.test(val), "No consecutive spaces allowed"),
      streetBuildingHouseNum: z.string({ required_error: "Street/Building/House number is required" }).trim().min(1, "Street address is required").refine((val) => !/\s{2,}/.test(val), "No consecutive spaces allowed"),
    }),
  }),
});

import { z } from "zod";

// Basic Schemas
export const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .email("Invalid email address")
  .max(254, "Email is too long");

export const usernameSchema = z
  .string({ required_error: "Username is required" })
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must not exceed 30 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
  .refine((val) => !/\s/.test(val), "Password cannot contain spaces");

// PH Mobile Number validation.
export const phMobileSchema = z
  .string({ required_error: "Phone number is required" })
  .regex(/^(09|\+639)\d{9}$/, "Invalid Philippine mobile number (must start with 09 or +639)");

// Full Name validation.
export const fullNameSchema = z
  .string({ required_error: "Full name is required" })
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Full name can only contain letters, spaces, hyphens, and apostrophes")
  .refine((val) => !/\s{2,}/.test(val), "No consecutive spaces allowed");

export const objectIdSchema = z.string().min(1, "Invalid ID format");

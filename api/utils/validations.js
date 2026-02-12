import { z } from "zod";

/**
 * Shared Zod Schemas for the entire project.
 * These replace the legacy manual regex functions in favor of a central Zod-based shield.
 */

export const USERNAME_REGEX = /^[a-zA-Z]+[a-zA-Z0-9]*$/;
export const PASSWORD_SYMBOL_REGEX = /[-!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;

/**
 * Email validation schema with strict TLD and format rules.
 */
export const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .min(1, "Email is required")
  .refine((val) => val.split("@").length === 2, "Email must contain exactly one @")
  .superRefine((val, ctx) => {
    const parts = val.split("@");
    if (parts.length !== 2) return;

    const [localPart, domain] = parts;

    if (!/^[a-zA-Z0-9._-]+$/.test(localPart)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Local part can only contain letters, numbers, ., -, or _" });
    }

    if (/([._-])\1/.test(localPart)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Local part cannot have consecutive symbols (., -, _)" });
    }

    if (/^[-._]|[-._]$/.test(localPart)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Local part cannot start or end with ., -, or _" });
    }

    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Domain can only contain letters, numbers, ., or -" });
    }

    if (/([.-])\1/.test(domain)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Domain cannot have consecutive symbols (., -)" });
    }

    if (/^[.-]|[.-]$/.test(domain)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Domain cannot start or end with . or -" });
    }

    const domainParts = domain.split(".");
    const tld = domainParts[domainParts.length - 1];
    if (!/^[a-zA-Z]{2,}$/.test(tld)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "TLD must be at least 2 letters and contain no numbers" });
    }

    if (domain.toLowerCase().endsWith(".com") && domain.toLowerCase() !== domain.toLowerCase().split(".com")[0] + ".com") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid domain (.com should not have extra letters)" });
    }
  });

/**
 * Username validation schema.
 */
export const usernameSchema = z
  .string({ required_error: "Username is required" })
  .trim()
  .min(3, "Username must be 3-30 characters long")
  .max(30, "Username must be 3-30 characters long")
  .regex(USERNAME_REGEX, "Username must start with a letter and contain no symbols")
  .toLowerCase();

/**
 * Password validation schema.
 */
export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
  .regex(/[0-9]/, "Password must contain at least one number (0-9)")
  .regex(PASSWORD_SYMBOL_REGEX, "Password must contain at least one symbol (!@#$% etc.)")
  .refine((val) => !/\s/.test(val), "Password cannot contain spaces");

/**
 * PH Mobile Number validation.
 */
export const phMobileSchema = z
  .string({ required_error: "Phone number is required" })
  .regex(/^(09|\+639)\d{9}$/, "Invalid Philippine mobile number (must start with 09 or +639)");

/**
 * Full Name validation.
 */
export const fullNameSchema = z
  .string({ required_error: "Full name is required" })
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Full name can only contain letters, spaces, hyphens, and apostrophes")
  .refine((val) => !/\s{2,}/.test(val), "No consecutive spaces allowed");

/**
 * Legacy-style validation wrapper functions.
 * These return { valid: boolean, message?: string } for backward compatibility.
 */
export const validatePHMobile = (phone) => {
  const result = phMobileSchema.safeParse(phone);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, message: result.error.issues[0]?.message || "Invalid phone number" };
};

export const validateFullName = (name) => {
  const result = fullNameSchema.safeParse(name);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, message: result.error.issues[0]?.message || "Invalid name" };
};

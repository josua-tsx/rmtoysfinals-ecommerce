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

import { z } from "zod";
import { emailSchema, passwordSchema, usernameSchema } from "./auth.schema";

export const jobDescriptionSchema = z
  .string({ required_error: "Job description is required" })
  .min(5, "Job description must be at least 5 characters")
  .max(200, "Job description cannot exceed 200 characters");

export const roleSchema = z.enum(["validatorStaff", "admin"], {
  required_error: "Role is required",
});

export const addWorkerSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    jobDescription: jobDescriptionSchema,
    role: roleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

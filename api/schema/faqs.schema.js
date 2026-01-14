import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

// Regex from original utils/validations.js (approximated based on usage)
const titleRegex = /^[a-zA-Z0-9\s?!.,':-]+$/; 
const answerRegex = /^[a-zA-Z0-9\s?!.,':-]+$/;

export const faqsSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required" })
        .trim()
        .min(1, "Title is required")
        .regex(titleRegex, "Invalid title format"),
    answer: z.string({ required_error: "Answer is required" })
        .trim()
        .min(1, "Answer is required")
        // .regex(answerRegex, "Invalid answer format"), // Commented out to be less strict if needed, matching controller
  }),
});

export const deleteMultiFaqsSchema = z.object({
  body: z.object({
    faqIds: z.array(objectIdSchema).min(1, "FaqIds should be an array!"),
  }),
});

export const updateFaqSchema = z.object({
  params: z.object({
    faqSingleId: objectIdSchema,
  }),
  body: z.object({
    title: z.string({ required_error: "Title is required" })
        .trim()
        .min(1, "Title is required")
        .regex(titleRegex, "Invalid title format"),
    answer: z.string({ required_error: "Answer is required" })
        .trim()
        .min(1, "Answer is required"),
  }),
});

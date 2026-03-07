import { z } from "zod";

export const addPointsSchema = z.object({
  body: z.object({
    pointsValue: z.number({ required_error: "Points value is required." }).min(0, "Points cannot be negative"),
  }),
});

export const editPointsSchema = z.object({
  body: z.object({
    pointsValue: z.number({ required_error: "Points value is required." }).min(0, "Points cannot be negative"),
  }),
});

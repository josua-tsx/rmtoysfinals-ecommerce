import { z } from "zod";

export const pointsSchema = z.object({
  pointsValue: z.preprocess(
    (val) => Number(val),
    z.number({ required_error: "Points value is required" }).min(0, "Points cannot be negative")
  ),
});

import { z } from "zod";

export const updateTripStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "boarding",
      "departed",
      "completed",
    ]),
  }),
});
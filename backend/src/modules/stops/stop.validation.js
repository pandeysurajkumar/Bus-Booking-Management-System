import { z } from "zod";

export const createStopSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    address: z.string().trim().max(300).optional(),

    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }).optional(),
  }),
});
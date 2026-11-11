import { z } from "zod";

export const createOperatorSchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(2).max(120),

    contactEmail: z.string().trim().email(),

    contactPhone: z.string().trim().min(10).max(15),

    address: z.string().trim().min(5).max(300),
  }),
});
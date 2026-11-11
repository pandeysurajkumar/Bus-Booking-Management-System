import { z } from "zod";

export const reportQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),

  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),

  status: z
    .enum([
      "scheduled",
      "boarding",
      "departed",
      "completed",
      "cancelled",
    ])
    .optional(),

  operatorId: z.string().optional(),
});

export const manifestParamsSchema = z.object({
  tripId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const manifestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});
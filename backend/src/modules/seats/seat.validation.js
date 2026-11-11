import { z } from "zod";

export const seatParamsSchema = z.object({
  params: z.object({
    tripId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const holdSeatSchema = z.object({
  params: z.object({
    tripId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),

  body: z.object({
    seatNumber: z.string().trim().min(1).max(10),
  }),
});

export const releaseSeatSchema = z.object({
  params: z.object({
    tripId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),

  body: z.object({
    seatNumber: z.string().trim().min(1).max(10),
  }),
});
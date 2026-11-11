import { z } from "zod";

export const createTripSchema = z.object({
  body: z.object({
    routeId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    busId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    departureAt: z.coerce.date(),
    arrivalAt: z.coerce.date(),
    fare: z.number().positive(),
  }).refine(
    (data) => data.arrivalAt > data.departureAt,
    {
      message: "Arrival must be after departure.",
      path: ["arrivalAt"],
    }
  ).refine(
    (data) => data.departureAt > new Date(),
    {
      message: "Departure must be in the future.",
      path: ["departureAt"],
    }
  ),
});

export const updateTripSchema = z.object({
  body: z.object({
    departureAt: z.coerce.date().optional(),
    arrivalAt: z.coerce.date().optional(),
    fare: z.number().positive().optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required.",
    }
  ),
});
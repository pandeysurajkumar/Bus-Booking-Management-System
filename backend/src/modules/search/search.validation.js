import { z } from "zod";

export const searchTripsSchema = z.object({
  query: z.object({
    originStopId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    destinationStopId: z.string().regex(/^[0-9a-fA-F]{24}$/),

    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

    busType: z.enum([
      "seater",
      "sleeper",
      "semi_sleeper",
    ]).optional(),

    minFare: z.coerce.number().min(0).optional(),
    maxFare: z.coerce.number().min(0).optional(),

    sortBy: z.enum([
      "departure",
      "arrival",
      "fare",
      "duration",
    ]).default("departure"),

    order: z.enum(["asc", "desc"]).default("asc"),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }).refine(
    (data) => data.originStopId !== data.destinationStopId,
    {
      message: "Origin and destination must be different.",
      path: ["destinationStopId"],
    }
  ).refine(
    (data) =>
      data.minFare === undefined ||
      data.maxFare === undefined ||
      data.minFare <= data.maxFare,
    {
      message: "Minimum fare cannot exceed maximum fare.",
      path: ["minFare"],
    }
  ).refine((data) => {
    const date = new Date(`${data.date}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === data.date;
  }, {
    message: "Invalid calendar date.",
    path: ["date"],
  }),
});
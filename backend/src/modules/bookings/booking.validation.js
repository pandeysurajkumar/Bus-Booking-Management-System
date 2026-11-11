import { z } from "zod";

const passengerSchema = z.object({
  seatNumber: z.string().trim().min(1).max(10),

  name: z.string().trim().min(2).max(100),

  age: z.number().int().min(1).max(120),

  gender: z.enum(["male", "female", "other"]),
});

export const createBookingSchema = z.object({
  body: z.object({
    tripId: z.string().regex(/^[0-9a-fA-F]{24}$/),

    originStopId: z.string().regex(/^[0-9a-fA-F]{24}$/),

    destinationStopId: z.string().regex(/^[0-9a-fA-F]{24}$/),

    passengers: z.array(passengerSchema).min(1).max(6),

    idempotencyKey: z.string().trim().min(8).max(100).optional(),
  }).refine(
    (data) => data.originStopId !== data.destinationStopId,
    {
      message: "Origin and destination must be different.",
      path: ["destinationStopId"],
    }
  ).refine(
    (data) => {
      const seats = data.passengers.map((p) =>
        p.seatNumber.toUpperCase()
      );

      return new Set(seats).size === seats.length;
    },
    {
      message: "Duplicate seat numbers are not allowed.",
      path: ["passengers"],
    }
  ),
});
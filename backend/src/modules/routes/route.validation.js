import { z } from "zod";

const routeStopSchema = z.object({
  stopId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  sequence: z.number().int().min(1),
  distanceFromStartKm: z.number().min(0),
  arrivalOffsetMinutes: z.number().int().min(0).optional(),
  departureOffsetMinutes: z.number().int().min(0).optional(),
});

export const createRouteSchema = z.object({
  body: z.object({
    operatorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    routeName: z.string().trim().min(2).max(150),
    originStopId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    destinationStopId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    stops: z.array(routeStopSchema).min(2),
    totalDistanceKm: z.number().positive(),
    estimatedDurationMinutes: z.number().int().positive(),
  }).superRefine((data, ctx) => {
    if (data.originStopId === data.destinationStopId) {
      ctx.addIssue({
        code: "custom",
        message: "Origin and destination must be different.",
        path: ["destinationStopId"],
      });
    }

    const sequences = data.stops.map((stop) => stop.sequence);

    if (new Set(sequences).size !== sequences.length) {
      ctx.addIssue({
        code: "custom",
        message: "Stop sequence numbers must be unique.",
        path: ["stops"],
      });
    }

    const sorted = [...data.stops].sort(
      (a, b) => a.sequence - b.sequence
    );

    if (
      sorted[0].stopId !== data.originStopId ||
      sorted[sorted.length - 1].stopId !== data.destinationStopId
    ) {
      ctx.addIssue({
        code: "custom",
        message: "First and last route stops must match origin and destination.",
        path: ["stops"],
      });
    }

    for (let i = 1; i < sorted.length; i++) {
      if (
        sorted[i].distanceFromStartKm <=
        sorted[i - 1].distanceFromStartKm
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Stop distances must increase with sequence.",
          path: ["stops"],
        });
        break;
      }
    }
  }),
});
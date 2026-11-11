import { z } from "zod";

const seatSchema = z.object({
  seatNumber: z.string().trim().min(1).max(10),
  row: z.number().int().min(1).max(30),
  column: z.number().int().min(1).max(10),
  deck: z.number().int().min(1).max(2).default(1),
  seatType: z.enum(["seater", "sleeper"]),
  position: z.enum(["window", "aisle", "middle"]),
  isActive: z.boolean().optional(),
});

const seatLayoutSchema = z.object({
  rows: z.number().int().min(1).max(30),
  columns: z.number().int().min(1).max(10),
  deckCount: z.number().int().min(1).max(2).default(1),
  seats: z.array(seatSchema).min(1),
}).superRefine((layout, ctx) => {
  const numbers = layout.seats.map((seat) =>
    seat.seatNumber.trim().toUpperCase()
  );

  if (new Set(numbers).size !== numbers.length) {
    ctx.addIssue({
      code: "custom",
      message: "Duplicate seat numbers are not allowed.",
      path: ["seats"],
    });
  }

  for (const [index, seat] of layout.seats.entries()) {
    if (seat.row > layout.rows) {
      ctx.addIssue({
        code: "custom",
        message: "Seat row exceeds the declared layout rows.",
        path: ["seats", index, "row"],
      });
    }

    if (seat.column > layout.columns) {
      ctx.addIssue({
        code: "custom",
        message: "Seat column exceeds the declared layout columns.",
        path: ["seats", index, "column"],
      });
    }

    if (seat.deck > layout.deckCount) {
      ctx.addIssue({
        code: "custom",
        message: "Seat deck exceeds the declared deck count.",
        path: ["seats", index, "deck"],
      });
    }
  }
});

export const createBusSchema = z.object({
  body: z.object({
    operatorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),

    registrationNumber: z.string().trim().min(4).max(20),

    busName: z.string().trim().min(2).max(100),

    busType: z.enum(["seater", "sleeper", "semi_sleeper"]),

    amenities: z.array(
      z.enum([
        "wifi",
        "charging_point",
        "water_bottle",
        "blanket",
        "reading_light",
        "air_conditioning",
        "entertainment",
      ])
    ).optional(),

    seatLayout: seatLayoutSchema,
  }),
});

export const updateBusSchema = z.object({
  body: z.object({
    busName: z.string().trim().min(2).max(100).optional(),
    busType: z.enum(["seater", "sleeper", "semi_sleeper"]).optional(),
    amenities: z.array(z.string()).optional(),
    status: z.enum(["active", "inactive", "maintenance"]).optional(),
    seatLayout: seatLayoutSchema.optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for an update.",
  }),
});
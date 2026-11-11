import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const auditQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    action: z.string().trim().max(100).optional(),
    entityType: z.string().trim().max(100).optional(),
    actorId: objectId.optional(),
    operatorId: objectId.optional(),

    status: z.enum(["success", "failure"]).optional(),

    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      new Date(data.startDate) <= new Date(data.endDate),
    {
      message: "startDate must be before or equal to endDate",
      path: ["endDate"],
    }
  );
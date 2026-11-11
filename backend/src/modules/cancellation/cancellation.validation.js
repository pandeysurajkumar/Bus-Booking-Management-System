import { z } from "zod";

export const updateCancellationPolicySchema = z.object({
  enabled: z.boolean(),

  rules: z
    .array(
      z.object({
        minHoursBeforeDeparture: z.number().min(0),
        refundPercentage: z.number().min(0).max(100),
      })
    )
    .min(1)
    .max(10),
}).superRefine((data, ctx) => {
  const thresholds = data.rules.map(
    (rule) => rule.minHoursBeforeDeparture
  );

  if (new Set(thresholds).size !== thresholds.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Duplicate cancellation thresholds are not allowed",
      path: ["rules"],
    });
  }
});

export const pnrParamsSchema = z.object({
  pnr: z.string().trim().min(5).max(30),
});
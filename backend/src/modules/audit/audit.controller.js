import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";

import { auditQuerySchema } from "./audit.validation.js";
import { getAuditLogs } from "./audit.service.js";

export const getAuditLogsController = asyncHandler(
  async (req, res) => {
    const parsed = auditQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues.map((issue) => issue.message).join(", ")
      );
    }

    const result = await getAuditLogs(req.user, parsed.data);

    res.status(200).json(
      new ApiResponse(200, result, "Audit logs fetched successfully")
    );
  }
);
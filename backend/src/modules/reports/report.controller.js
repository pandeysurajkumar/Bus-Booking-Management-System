import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";

import {
  reportQuerySchema,
  manifestParamsSchema,
  manifestQuerySchema,
} from "./report.validation.js";

import {
  getOperatorTripReports,
  getOperatorDashboardSummary,
  getTripPassengerManifest,
} from "./report.service.js";

const parseQuery = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError(
      400,
      result.error.issues.map((issue) => issue.message).join(", ")
    );
  }

  return result.data;
};

export const getTripReportsController = asyncHandler(
  async (req, res) => {
    const query = parseQuery(reportQuerySchema, req.query);

    const reports = await getOperatorTripReports(
      req.user,
      query
    );

    res.status(200).json(
      new ApiResponse(200, reports, "Trip reports fetched")
    );
  }
);

export const getDashboardSummaryController = asyncHandler(
  async (req, res) => {
    const query = parseQuery(reportQuerySchema, req.query);

    const summary = await getOperatorDashboardSummary(
      req.user,
      query
    );

    res.status(200).json(
      new ApiResponse(200, summary, "Dashboard summary fetched")
    );
  }
);

export const getPassengerManifestController = asyncHandler(
  async (req, res) => {
    const params = parseQuery(
      manifestParamsSchema,
      req.params
    );

    const query = parseQuery(
      manifestQuerySchema,
      req.query
    );

    const manifest = await getTripPassengerManifest(
      req.user,
      params.tripId,
      query
    );

    res.status(200).json(
      new ApiResponse(200, manifest, "Passenger manifest fetched")
    );
  }
);
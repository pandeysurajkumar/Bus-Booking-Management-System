import mongoose from "mongoose";
import Route from "./route.model.js";
import Stop from "../stops/stop.model.js";
import Operator from "../operators/operator.model.js";
import ApiError from "../../utils/ApiError.js";

export const createRoute = async (data, user) => {
  let operatorId;

  if (user.role === "admin") {
    operatorId = data.operatorId;

    if (!operatorId) {
      throw new ApiError(400, "Operator ID is required.");
    }
  } else if (user.role === "operator") {
    operatorId = user.operatorId?.toString();

    if (!operatorId) {
      throw new ApiError(403, "Operator account is not linked.");
    }
  } else {
    throw new ApiError(403, "Access denied.");
  }

  const operator = await Operator.findById(operatorId);

  if (!operator || operator.status !== "active") {
    throw new ApiError(404, "Active operator not found.");
  }

  const sortedStops = [...data.stops].sort(
    (a, b) => a.sequence - b.sequence
  );

  const stopIds = sortedStops.map((stop) => stop.stopId);

  const validStops = await Stop.find({
    _id: { $in: stopIds },
    status: "active",
  });

  if (validStops.length !== stopIds.length) {
    throw new ApiError(400, "One or more stops are invalid or inactive.");
  }

  if (
    sortedStops[0].stopId !== data.originStopId ||
    sortedStops[sortedStops.length - 1].stopId !== data.destinationStopId
  ) {
    throw new ApiError(400, "Route endpoints do not match its stops.");
  }

  return Route.create({
    ...data,
    operatorId,
    stops: sortedStops,
    createdBy: user._id,
  });
};

export const getRoutes = async (query, user) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const filter = {};

  if (query.status) filter.status = query.status;

  if (query.originStopId) filter.originStopId = query.originStopId;

  if (query.destinationStopId) {
    filter.destinationStopId = query.destinationStopId;
  }

  if (user.role === "operator") {
    filter.operatorId = user.operatorId;
  } else if (user.role !== "admin") {
    throw new ApiError(403, "Access denied.");
  }

  const [routes, total] = await Promise.all([
    Route.find(filter)
      .populate("operatorId", "companyName")
      .populate("originStopId", "name city")
      .populate("destinationStopId", "name city")
      .populate("stops.stopId", "name city")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Route.countDocuments(filter),
  ]);

  return {
    routes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getRouteById = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid route ID.");
  }

  const route = await Route.findById(id)
    .populate("operatorId", "companyName")
    .populate("originStopId", "name city")
    .populate("destinationStopId", "name city")
    .populate("stops.stopId", "name city");

  if (!route) {
    throw new ApiError(404, "Route not found.");
  }

  if (
    user.role === "operator" &&
    route.operatorId._id.toString() !== user.operatorId?.toString()
  ) {
    throw new ApiError(403, "Access denied.");
  }

  if (!["admin", "operator"].includes(user.role)) {
    throw new ApiError(403, "Access denied.");
  }

  return route;
};
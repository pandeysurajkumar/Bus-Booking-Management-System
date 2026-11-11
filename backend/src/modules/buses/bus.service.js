import mongoose from "mongoose";
import Bus from "./bus.model.js";
import Operator from "../operators/operator.model.js";
import ApiError from "../../utils/ApiError.js";

export const createBus = async (data, user) => {
  let operatorId;

  if (user.role === "admin") {
    operatorId = data.operatorId;

    if (!operatorId) {
      throw new ApiError(400, "Admin must provide an operatorId.");
    }
  } else if (user.role === "operator") {
    operatorId = user.operatorId?.toString();

    if (!operatorId) {
      throw new ApiError(403, "Your account is not linked to an operator.");
    }
  } else {
    throw new ApiError(403, "You are not allowed to create buses.");
  }

  const operator = await Operator.findById(operatorId);

  if (!operator || operator.status !== "active") {
    throw new ApiError(400, "Active operator not found.");
  }

  const registrationNumber = data.registrationNumber
    .trim()
    .toUpperCase();

  const existingBus = await Bus.findOne({ registrationNumber });

  if (existingBus) {
    throw new ApiError(409, "This registration number is already registered.");
  }

  const bus = await Bus.create({
    ...data,
    operatorId,
    registrationNumber,
    createdBy: user._id,
  });

  return bus;
};

export const getBuses = async (query, user) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.busType) {
    filter.busType = query.busType;
  }

  if (query.search) {
    const search = query.search.trim();

    filter.$or = [
      { busName: { $regex: search, $options: "i" } },
      { registrationNumber: { $regex: search, $options: "i" } },
    ];
  }

  if (user.role === "operator") {
    if (!user.operatorId) {
      throw new ApiError(403, "Your account is not linked to an operator.");
    }

    filter.operatorId = user.operatorId;
  } else if (user.role !== "admin") {
    throw new ApiError(403, "You are not allowed to view managed buses.");
  }

  const [buses, total] = await Promise.all([
    Bus.find(filter)
      .populate("operatorId", "companyName contactEmail")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Bus.countDocuments(filter),
  ]);

  return {
    buses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getBusById = async (busId, user) => {
  if (!mongoose.isValidObjectId(busId)) {
    throw new ApiError(400, "Invalid bus ID.");
  }

  const bus = await Bus.findById(busId).populate(
    "operatorId",
    "companyName contactEmail"
  );

  if (!bus) {
    throw new ApiError(404, "Bus not found.");
  }

  if (
    user.role === "operator" &&
    bus.operatorId._id.toString() !== user.operatorId?.toString()
  ) {
    throw new ApiError(403, "You cannot access another operator's bus.");
  }

  if (!["admin", "operator"].includes(user.role)) {
    throw new ApiError(403, "You are not allowed to view this bus.");
  }

  return bus;
};

export const updateBus = async (busId, data, user) => {
  if (!mongoose.isValidObjectId(busId)) {
    throw new ApiError(400, "Invalid bus ID.");
  }

  const bus = await Bus.findById(busId);

  if (!bus) {
    throw new ApiError(404, "Bus not found.");
  }

  if (
    user.role === "operator" &&
    bus.operatorId.toString() !== user.operatorId?.toString()
  ) {
    throw new ApiError(403, "You cannot update another operator's bus.");
  }

  if (!["admin", "operator"].includes(user.role)) {
    throw new ApiError(403, "You are not allowed to update buses.");
  }

  // Do not allow changing ownership through the update endpoint.
  delete data.operatorId;
  delete data.registrationNumber;

  Object.assign(bus, data);

  await bus.save();

  return bus;
};

export const archiveBus = async (busId, user) => {
  if (!mongoose.isValidObjectId(busId)) {
    throw new ApiError(400, "Invalid bus ID.");
  }

  const bus = await Bus.findById(busId);

  if (!bus) {
    throw new ApiError(404, "Bus not found.");
  }

  if (
    user.role === "operator" &&
    bus.operatorId.toString() !== user.operatorId?.toString()
  ) {
    throw new ApiError(403, "You cannot archive another operator's bus.");
  }

  if (!["admin", "operator"].includes(user.role)) {
    throw new ApiError(403, "You are not allowed to archive buses.");
  }

  bus.status = "inactive";
  await bus.save();

  return bus;
};
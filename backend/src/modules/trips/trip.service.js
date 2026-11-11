import mongoose from "mongoose";
import Trip from "./trip.model.js";
import Route from "../routes/route.model.js";
import Bus from "../buses/bus.model.js";
import Operator from "../operators/operator.model.js";
import ApiError from "../../utils/ApiError.js";
import { withBusScheduleLock } from "./trip.schedule-lock.js";
import { initializeTripSeats } from "../seats/seat.service.js";

export const createTrip = async (data, user) => {
  const route = await Route.findById(data.routeId);
  const bus = await Bus.findById(data.busId);

  if (!route || route.status !== "active") {
    throw new ApiError(404, "Active route not found.");
  }

  if (!bus || bus.status !== "active") {
    throw new ApiError(404, "Active bus not found.");
  }

  if (route.operatorId.toString() !== bus.operatorId.toString()) {
    throw new ApiError(400, "Route and bus must belong to the same operator.");
  }

  let operatorId;

  if (user.role === "admin") {
    operatorId = route.operatorId.toString();
  } else if (user.role === "operator") {
    operatorId = user.operatorId?.toString();

    if (!operatorId || operatorId !== route.operatorId.toString()) {
      throw new ApiError(403, "Access denied.");
    }
  } else {
    throw new ApiError(403, "Access denied.");
  }

  const operator = await Operator.findById(operatorId);

  if (!operator || operator.status !== "active") {
    throw new ApiError(400, "Operator is inactive.");
  }

  const departureAt = new Date(data.departureAt);
  const arrivalAt = new Date(data.arrivalAt);

  if (departureAt <= new Date()) {
    throw new ApiError(400, "Departure must be in the future.");
  }

  if (arrivalAt <= departureAt) {
    throw new ApiError(400, "Arrival must be after departure.");
  }

  return withBusScheduleLock(bus._id, async (lockedBus) => {
    if (lockedBus.status !== "active") {
      throw new ApiError(400, "Bus is not active.");
    }

    const overlap = await Trip.findOne({
      busId: lockedBus._id,
      status: { $in: ["scheduled", "boarding", "departed"] },
      departureAt: { $lt: arrivalAt },
      arrivalAt: { $gt: departureAt },
    }).select("_id");

    if (overlap) {
      throw new ApiError(409, "Bus already has an overlapping trip.");
    }

    const totalSeats = lockedBus.seatLayout.seats.filter(
      (seat) => seat.isActive
    ).length;

    if (totalSeats === 0) {
      throw new ApiError(400, "Bus has no active seats.");
    }

    const trip = await Trip.create({
      operatorId,
      routeId: route._id,
      busId: lockedBus._id,
      departureAt,
      arrivalAt,
      fare: data.fare,
      availableSeats: totalSeats,
      createdBy: user._id,
    });

    try {
      await initializeTripSeats(trip);
    } catch (error) {
      await Trip.deleteOne({ _id: trip._id });
      throw error;
    }

    return trip;
  });
};

export const getTrips = async (query, user) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const filter = {};

  if (query.status) filter.status = query.status;

  if (query.routeId) filter.routeId = query.routeId;

  if (query.busId) filter.busId = query.busId;

  if (user.role === "operator") {
    if (!user.operatorId) {
      throw new ApiError(403, "Operator account is not linked.");
    }

    filter.operatorId = user.operatorId;
  } else if (user.role !== "admin") {
    throw new ApiError(403, "Access denied.");
  }

  const [trips, total] = await Promise.all([
    Trip.find(filter)
      .populate("operatorId", "companyName")
      .populate("routeId")
      .populate("busId", "busName registrationNumber busType")
      .sort({ departureAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Trip.countDocuments(filter),
  ]);

  return {
    trips,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTripById = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid trip ID.");
  }

  const trip = await Trip.findById(id)
    .populate("operatorId", "companyName")
    .populate("routeId")
    .populate("busId", "busName registrationNumber busType seatLayout");

  if (!trip) {
    throw new ApiError(404, "Trip not found.");
  }

  if (
    user.role === "operator" &&
    trip.operatorId._id.toString() !== user.operatorId?.toString()
  ) {
    throw new ApiError(403, "Access denied.");
  }

  if (!["admin", "operator"].includes(user.role)) {
    throw new ApiError(403, "Access denied.");
  }

  return trip;
};

export const updateTrip = async (id, data, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid trip ID.");
  }

  const existingTrip = await Trip.findById(id);

  if (!existingTrip) {
    throw new ApiError(404, "Trip not found.");
  }

  if (
    user.role === "operator" &&
    existingTrip.operatorId.toString() !== user.operatorId?.toString()
  ) {
    throw new ApiError(403, "Access denied.");
  }

  if (!["admin", "operator"].includes(user.role)) {
    throw new ApiError(403, "Access denied.");
  }

  return withBusScheduleLock(existingTrip.busId, async () => {
    const trip = await Trip.findById(id);

    if (!trip) {
      throw new ApiError(404, "Trip not found.");
    }

    if (trip.status !== "scheduled") {
      throw new ApiError(409, "Only scheduled trips can be updated.");
    }

    const departureAt = data.departureAt ?? trip.departureAt;
    const arrivalAt = data.arrivalAt ?? trip.arrivalAt;

    if (departureAt <= new Date()) {
      throw new ApiError(400, "Departure must be in the future.");
    }

    if (arrivalAt <= departureAt) {
      throw new ApiError(400, "Arrival must be after departure.");
    }

    const overlap = await Trip.findOne({
      _id: { $ne: trip._id },
      busId: trip.busId,
      status: { $in: ["scheduled", "boarding", "departed"] },
      departureAt: { $lt: arrivalAt },
      arrivalAt: { $gt: departureAt },
    }).select("_id");

    if (overlap) {
      throw new ApiError(409, "Bus already has an overlapping trip.");
    }

    if (data.departureAt) trip.departureAt = departureAt;
    if (data.arrivalAt) trip.arrivalAt = arrivalAt;
    if (data.fare !== undefined) trip.fare = data.fare;

    await trip.save();

    return trip;
  });
};

export const cancelTrip = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid trip ID.");
  }

  const trip = await Trip.findById(id);

  if (!trip) {
    throw new ApiError(404, "Trip not found.");
  }

  if (
    user.role === "operator" &&
    trip.operatorId.toString() !== user.operatorId?.toString()
  ) {
    throw new ApiError(403, "Access denied.");
  }

  if (!["admin", "operator"].includes(user.role)) {
    throw new ApiError(403, "Access denied.");
  }

  const cancelledTrip = await Trip.findOneAndUpdate(
    {
      _id: id,
      status: "scheduled",
    },
    {
      $set: { status: "cancelled" },
    },
    { new: true, runValidators: true }
  );

  if (!cancelledTrip) {
    throw new ApiError(409, "Trip is no longer in a cancellable state.");
  }

  return cancelledTrip;
};

export const updateTripStatus = async (id, status, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid trip ID.");
  }

  const transitions = {
    scheduled: "boarding",
    boarding: "departed",
    departed: "completed",
  };

  if (!["admin", "operator"].includes(user.role)) {
    throw new ApiError(403, "Access denied.");
  }

  const trip = await Trip.findById(id);

  if (!trip) {
    throw new ApiError(404, "Trip not found.");
  }

  if (
    user.role === "operator" &&
    trip.operatorId.toString() !== user.operatorId?.toString()
  ) {
    throw new ApiError(403, "Access denied.");
  }

  const expectedCurrentStatus = Object.keys(transitions).find(
    (key) => transitions[key] === status
  );

  if (!expectedCurrentStatus) {
    throw new ApiError(400, "Invalid status transition.");
  }

  const updatedTrip = await Trip.findOneAndUpdate(
    {
      _id: id,
      status: expectedCurrentStatus,
    },
    {
      $set: { status },
    },
    { new: true, runValidators: true }
  );

  if (!updatedTrip) {
    throw new ApiError(409, "Trip status has changed. Refresh and retry.");
  }

  return updatedTrip;
};
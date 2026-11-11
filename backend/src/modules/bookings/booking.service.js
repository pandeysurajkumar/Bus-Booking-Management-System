import mongoose from "mongoose";
import { randomBytes } from "crypto";

import Booking from "./booking.model.js";
import Trip from "../trips/trip.model.js";
import Route from "../routes/route.model.js";
import Stop from "../stops/stop.model.js";
import TripSeat from "../seats/trip-seat.model.js";

import ApiError from "../../utils/ApiError.js";

const generatePNR = () => {
  return `BUS${randomBytes(5).toString("hex").toUpperCase()}`;
};

export const createBooking = async (data, user) => {
  const userId = user._id;

  // Idempotency: return the original booking for a repeated request.
  if (data.idempotencyKey) {
    const existingBooking = await Booking.findOne({
      userId,
      idempotencyKey: data.idempotencyKey,
    });

    if (existingBooking) return existingBooking;
  }

  const trip = await Trip.findById(data.tripId);

  if (!trip || trip.status !== "scheduled") {
    throw new ApiError(404, "Available scheduled trip not found.");
  }

  if (trip.departureAt <= new Date()) {
    throw new ApiError(409, "Trip departure time has passed.");
  }

  const route = await Route.findById(trip.routeId)
    .populate("stops.stopId", "name city");

  if (!route || route.status !== "active") {
    throw new ApiError(404, "Active route not found.");
  }

  const origin = await Stop.findOne({
    _id: data.originStopId,
    status: "active",
  });

  const destination = await Stop.findOne({
    _id: data.destinationStopId,
    status: "active",
  });

  if (!origin || !destination) {
    throw new ApiError(404, "Journey stop not found.");
  }

  const sortedStops = [...route.stops].sort(
    (a, b) => a.sequence - b.sequence
  );

  const originIndex = sortedStops.findIndex(
    (stop) => stop.stopId?._id.toString() === origin._id.toString()
  );

  const destinationIndex = sortedStops.findIndex(
    (stop) =>
      stop.stopId?._id.toString() === destination._id.toString()
  );

  if (
    originIndex === -1 ||
    destinationIndex === -1 ||
    originIndex >= destinationIndex
  ) {
    throw new ApiError(400, "Invalid journey stops for this route.");
  }

  const originOffset =
    sortedStops[originIndex].departureOffsetMinutes ??
    sortedStops[originIndex].arrivalOffsetMinutes ??
    0;

  const destinationOffset =
    sortedStops[destinationIndex].arrivalOffsetMinutes ??
    sortedStops[destinationIndex].departureOffsetMinutes ??
    0;

  const departureAt = new Date(
    trip.departureAt.getTime() + originOffset * 60000
  );

  const arrivalAt = new Date(
    trip.departureAt.getTime() + destinationOffset * 60000
  );

  if (departureAt <= new Date()) {
    throw new ApiError(409, "Boarding time for this journey has passed.");
  }

  if (arrivalAt <= departureAt) {
    throw new ApiError(400, "Invalid journey timings.");
  }

  const seatNumbers = data.passengers.map((passenger) =>
    passenger.seatNumber.trim().toUpperCase()
  );

  const now = new Date();

  const bookingId = new mongoose.Types.ObjectId();

  const pnr = generatePNR();

  // Atomically claim every requested seat.
  const seatUpdate = await TripSeat.updateMany(
    {
      tripId: trip._id,
      seatNumber: { $in: seatNumbers },
      status: "held",
      heldBy: userId,
      holdUntil: { $gt: now },
      bookingId: null,
    },
    {
      $set: {
        status: "booked",
        bookingId,
        heldBy: null,
        holdUntil: null,
      },
    }
  );

  if (seatUpdate.modifiedCount !== seatNumbers.length) {
    await TripSeat.updateMany(
      {
        tripId: trip._id,
        bookingId,
        status: "booked",
      },
      {
        $set: {
          status: "held",
          bookingId: null,
          heldBy: userId,
          holdUntil: new Date(Date.now() + 60000),
        },
      }
    );

    throw new ApiError(
      409,
      "One or more seat holds expired or are unavailable. Please select seats again."
    );
  }

  try {
    const passengers = data.passengers.map((passenger) => ({
      seatNumber: passenger.seatNumber.trim().toUpperCase(),
      name: passenger.name,
      age: passenger.age,
      gender: passenger.gender,
      fare: trip.fare,
    }));

    const totalAmount = passengers.reduce(
      (total, passenger) => total + passenger.fare,
      0
    );


    const booking = await Booking.create({
    _id: bookingId,
    pnr,
    userId,
    tripId: trip._id,
    operatorId: trip.operatorId,
    routeId: trip.routeId,
    busId: trip.busId,
    originStopId: origin._id,
    destinationStopId: destination._id,

    journey: {
        originName: `${origin.name}, ${origin.city}`,
        destinationName: `${destination.name}, ${destination.city}`,
        departureAt,
        arrivalAt,
    },

    passengers,
    totalAmount,
    currency: trip.currency,
    status: "confirmed",
    paymentStatus: "pending",
    idempotencyKey: data.idempotencyKey,
    });

    // Atomically decrease available seats.
    const availabilityUpdate = await Trip.updateOne(
    {
        _id: trip._id,
        availableSeats: { $gte: passengers.length },
    },
    {
        $inc: {
        availableSeats: -passengers.length,
        },
    }
    );

    if (availabilityUpdate.modifiedCount !== 1) {
    throw new ApiError(409, "Insufficient available seats.");
    }

    return booking;

  } catch (error) {
    await Booking.deleteOne({ _id: bookingId });
    await TripSeat.updateMany(
      {
        tripId: trip._id,
        bookingId,
        status: "booked",
      },
      {
        $set: {
          status: "held",
          bookingId: null,
          heldBy: userId,
          holdUntil: new Date(Date.now() + 60000),
        },
      }
    );

    if (error.code === 11000) {
      const existing = data.idempotencyKey
        ? await Booking.findOne({ userId, idempotencyKey: data.idempotencyKey })
        : null;

      if (existing) return existing;
    }

    throw error;
  }
};

export const getMyBookings = async (userId, query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

  const filter = { userId };

  if (query.status) {
    filter.status = query.status;
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("tripId", "departureAt arrivalAt status")
      .populate("busId", "busName registrationNumber busType")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getBookingByPNR = async (pnr, user) => {
  const booking = await Booking.findOne({
    pnr: pnr.toUpperCase(),
  })
    .populate("tripId")
    .populate("busId", "busName registrationNumber busType")
    .populate("operatorId", "companyName")
    .populate("originStopId", "name city")
    .populate("destinationStopId", "name city");

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  if (
    booking.userId.toString() !== user._id.toString() &&
    user.role !== "admin" &&
    user.role !== "operator"
  ) {
    throw new ApiError(403, "You cannot access this booking.");
  }

  if (
    user.role === "operator" &&
    booking.operatorId._id.toString() !== user.operatorId?.toString()
  ) {
    throw new ApiError(403, "You cannot access another operator's booking.");
  }

  return booking;
};
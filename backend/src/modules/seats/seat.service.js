import mongoose from "mongoose";
import Bus from "../buses/bus.model.js";

import TripSeat from "./trip-seat.model.js";
import Trip from "../trips/trip.model.js";

import ApiError from "../../utils/ApiError.js";

const HOLD_DURATION_MINUTES = 5;

export const initializeTripSeats = async (trip) => {
  const bus = await Bus.findById(trip.busId);

  if (!bus) {
    throw new ApiError(404, "Bus not found.");
  }

  const seats = bus.seatLayout.seats
    .filter((seat) => seat.isActive)
    .map((seat) => ({
      tripId: trip._id,
      busId: bus._id,
      seatNumber: seat.seatNumber.toUpperCase(),
      seatType: seat.seatType,
      position: seat.position,
      row: seat.row,
      column: seat.column,
      deck: seat.deck,
      status: "available",
    }));

  if (seats.length === 0) {
    throw new ApiError(400, "No active seats found.");
  }

  await TripSeat.insertMany(seats, { ordered: true });

  return seats;
};

export const getTripSeats = async (tripId) => {
  if (!mongoose.isValidObjectId(tripId)) {
    throw new ApiError(400, "Invalid trip ID.");
  }

  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new ApiError(404, "Trip not found.");
  }

  if (trip.status === "cancelled" || trip.status === "completed") {
    throw new ApiError(409, "Seat selection is unavailable for this trip.");
  }

  const now = new Date();

  await TripSeat.updateMany(
    {
      tripId,
      status: "held",
      holdUntil: { $lte: now },
    },
    {
      $set: {
        status: "available",
        heldBy: null,
        holdUntil: null,
      },
    }
  );

  const seats = await TripSeat.find({ tripId })
    .select("-heldBy -bookingId -__v")
    .sort({ deck: 1, row: 1, column: 1 });

  return {
    tripId,
    totalSeats: seats.length,
    availableSeats: seats.filter(
      (seat) => seat.status === "available"
    ).length,
    heldSeats: seats.filter(
      (seat) => seat.status === "held"
    ).length,
    bookedSeats: seats.filter(
      (seat) => seat.status === "booked"
    ).length,
    seats,
  };
};

export const holdSeat = async (tripId, seatNumber, user) => {
  if (!mongoose.isValidObjectId(tripId)) {
    throw new ApiError(400, "Invalid trip ID.");
  }

  const trip = await Trip.findById(tripId);

  if (!trip || trip.status !== "scheduled") {
    throw new ApiError(404, "Available scheduled trip not found.");
  }

  const now = new Date();

  await TripSeat.updateMany(
    {
      tripId,
      status: "held",
      holdUntil: { $lte: now },
    },
    {
      $set: {
        status: "available",
        heldBy: null,
        holdUntil: null,
      },
    }
  );

  const holdUntil = new Date(
    now.getTime() + HOLD_DURATION_MINUTES * 60 * 1000
  );

  const seat = await TripSeat.findOneAndUpdate(
    {
      tripId,
      seatNumber: seatNumber.trim().toUpperCase(),
      $or: [
        { status: "available" },
        {
          status: "held",
          holdUntil: { $lte: now },
        },
      ],
    },
    {
      $set: {
        status: "held",
        heldBy: user._id || user.id,
        holdUntil,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!seat) {
    throw new ApiError(
      409,
      "Seat is unavailable or already held by another passenger."
    );
  }

  return {
    seatNumber: seat.seatNumber,
    status: seat.status,
    holdUntil: seat.holdUntil,
  };
};

export const releaseSeat = async (tripId, seatNumber, user) => {
  if (!mongoose.isValidObjectId(tripId)) {
    throw new ApiError(400, "Invalid trip ID.");
  }

  const seat = await TripSeat.findOneAndUpdate(
    {
      tripId,
      seatNumber: seatNumber.trim().toUpperCase(),
      status: "held",
      heldBy: user._id || user.id,
      holdUntil: { $gt: new Date() },
    },
    {
      $set: {
        status: "available",
        heldBy: null,
        holdUntil: null,
      },
    },
    { new: true }
  );

  if (!seat) {
    throw new ApiError(
      409,
      "Active seat hold not found for this passenger."
    );
  }

  return seat;
};


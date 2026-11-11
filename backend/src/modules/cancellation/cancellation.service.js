import { randomBytes } from "crypto";

import Booking from "../bookings/booking.model.js";
import Trip from "../trips/trip.model.js";
import TripSeat from "../seats/trip-seat.model.js";
import CancellationPolicy from "./cancellation-policy.model.js";

import ApiError from "../../utils/ApiError.js";

const DEFAULT_RULES = [
  { minHoursBeforeDeparture: 24, refundPercentage: 100 },
  { minHoursBeforeDeparture: 6, refundPercentage: 50 },
  { minHoursBeforeDeparture: 0, refundPercentage: 0 },
];

export const getCancellationPolicy = async () => {
  const policy = await CancellationPolicy.findOne({
    key: "default",
  }).lean();

  return policy || {
    enabled: true,
    rules: DEFAULT_RULES,
  };
};

export const updateCancellationPolicy = async (data, userId) => {
  const rules = [...data.rules].sort(
    (a, b) =>
      b.minHoursBeforeDeparture - a.minHoursBeforeDeparture
  );

  return CancellationPolicy.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        enabled: data.enabled,
        rules,
        updatedBy: userId,
      },
      $setOnInsert: {
        createdBy: userId,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

const calculateRefund = (booking, trip, policy) => {
  if (booking.paymentStatus !== "paid") {
    return {
      status: "not_applicable",
      amount: 0,
      percentage: 0,
      reference: null,
      processedAt: null,
    };
  }

  if (trip.status === "cancelled") {
    return {
      status: "processed",
      amount: booking.totalAmount,
      percentage: 100,
      reference: `REF-${randomBytes(5).toString("hex").toUpperCase()}`,
      processedAt: new Date(),
    };
  }

  if (!policy.enabled) {
    throw new ApiError(403, "Cancellations are disabled");
  }

  const hoursRemaining =
    (new Date(booking.journey.departureAt).getTime() - Date.now()) /
    (1000 * 60 * 60);

  const applicableRule = [...policy.rules]
    .sort(
      (a, b) =>
        b.minHoursBeforeDeparture - a.minHoursBeforeDeparture
    )
    .find(
      (rule) =>
        hoursRemaining >= rule.minHoursBeforeDeparture
    );

  const percentage = applicableRule?.refundPercentage ?? 0;

  const amount = Number(
    ((booking.totalAmount * percentage) / 100).toFixed(2)
  );

  return {
    status: "processed",
    amount,
    percentage,
    reference: `REF-${randomBytes(5).toString("hex").toUpperCase()}`,
    processedAt: new Date(),
  };
};

export const simulatePayment = async (pnr, userId) => {
  const booking = await Booking.findOne({
    pnr: pnr.toUpperCase(),
    userId,
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status !== "confirmed") {
    throw new ApiError(409, "Only confirmed bookings can be paid");
  }

  const updatedBooking = await Booking.findOneAndUpdate(
    {
      _id: booking._id,
      status: "confirmed",
      paymentStatus: "pending",
    },
    {
      $set: {
        paymentStatus: "paid",
      },
    },
    { new: true }
  );

  if (!updatedBooking) {
    throw new ApiError(409, "Payment already processed");
  }

  return updatedBooking;
};

export const cancelBooking = async (pnr, user) => {
  const booking = await Booking.findOne({
    pnr: pnr.toUpperCase(),
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  const isOwner =
    booking.userId.toString() === user._id.toString();

  const isAdmin = user.role === "admin";

  const isOperator =
    user.role === "operator" &&
    booking.operatorId.toString() === user.operatorId?.toString();

  if (!isOwner && !isAdmin && !isOperator) {
    throw new ApiError(403, "You cannot cancel this booking");
  }

  if (booking.status !== "confirmed") {
    throw new ApiError(409, "Booking is already cancelled");
  }

  const trip = await Trip.findById(booking.tripId);

  if (!trip) {
    throw new ApiError(404, "Associated trip not found");
  }

  if (
    trip.status === "departed" ||
    trip.status === "completed"
  ) {
    throw new ApiError(409, "Trip has already departed");
  }

  if (
    trip.status !== "cancelled" &&
    new Date(booking.journey.departureAt) <= new Date()
  ) {
    throw new ApiError(409, "Journey departure time has passed");
  }

  const policy = await getCancellationPolicy();

  if (
    !policy.enabled &&
    trip.status !== "cancelled" &&
    booking.paymentStatus === "paid"
  ) {
    throw new ApiError(403, "Cancellations are disabled");
  }

  const refund = calculateRefund(booking, trip, policy);

  const cancelledBooking = await Booking.findOneAndUpdate(
    {
      _id: booking._id,
      status: "confirmed",
    },
    {
      $set: {
        status: "cancelled",
        refund,
        cancelledAt: new Date(),
        paymentStatus:
          refund.status === "processed"
            ? "refunded"
            : booking.paymentStatus,
      },
    },
    { new: true }
  );

  if (!cancelledBooking) {
    throw new ApiError(409, "Booking has already been cancelled");
  }

  try {
    const seatRelease = await TripSeat.updateMany(
      {
        tripId: booking.tripId,
        bookingId: booking._id,
        status: "booked",
      },
      {
        $set: {
          status: "available",
          bookingId: null,
          heldBy: null,
          holdUntil: null,
        },
      }
    );

    if (
      seatRelease.modifiedCount !== booking.passengers.length
    ) {
      throw new Error("Seat release count mismatch");
    }

    const tripUpdate = await Trip.updateOne(
      { _id: booking.tripId },
      {
        $inc: {
          availableSeats: seatRelease.modifiedCount,
        },
      }
    );

    if (tripUpdate.modifiedCount !== 1) {
      throw new Error("Trip availability update failed");
    }
  } catch (error) {
    await TripSeat.updateMany(
      {
        tripId: booking.tripId,
        bookingId: booking._id,
        status: "available",
      },
      {
        $set: {
          status: "booked",
          bookingId: booking._id,
        },
      }
    );

    await Booking.updateOne(
      {
        _id: booking._id,
        status: "cancelled",
      },
      {
        $set: {
          status: "confirmed",
          paymentStatus: booking.paymentStatus,
          refund: booking.refund,
        },
        $unset: {
          cancelledAt: 1,
        },
      }
    );

    throw new ApiError(500, "Cancellation failed. Please retry.");
  }

  return cancelledBooking;
};
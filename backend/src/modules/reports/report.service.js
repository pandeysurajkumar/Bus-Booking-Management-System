import mongoose from "mongoose";

import Trip from "../trips/trip.model.js";
import Booking from "../bookings/booking.model.js";
import TripSeat from "../seats/trip-seat.model.js";

import ApiError from "../../utils/ApiError.js";

const getOperatorFilter = (user, requestedOperatorId) => {
  if (user.role === "operator") {
    if (!user.operatorId) {
      throw new ApiError(403, "Operator account is not linked");
    }

    return {
      operatorId: user.operatorId,
    };
  }

  if (user.role === "admin" && requestedOperatorId) {
    if (!mongoose.isValidObjectId(requestedOperatorId)) {
      throw new ApiError(400, "Invalid operator ID");
    }

    return {
      operatorId: requestedOperatorId,
    };
  }

  return {};
};

const buildDateFilter = (startDate, endDate) => {
  const filter = {};

  if (startDate || endDate) {
    filter.departureAt = {};

    if (startDate) {
      filter.departureAt.$gte = new Date(startDate);
    }

    if (endDate) {
      filter.departureAt.$lte = new Date(endDate);
    }
  }

  return filter;
};

export const getOperatorTripReports = async (user, query) => {
  const operatorFilter = getOperatorFilter(
    user,
    query.operatorId
  );

  const dateFilter = buildDateFilter(
    query.startDate,
    query.endDate
  );

  const filter = {
    ...operatorFilter,
    ...dateFilter,
  };

  if (query.status) {
    filter.status = query.status;
  }

  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const [trips, total] = await Promise.all([
    Trip.find(filter)
      .populate("routeId", "routeName originStopId destinationStopId")
      .populate("busId", "registrationNumber busName busType")
      .sort({ departureAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Trip.countDocuments(filter),
  ]);

  const reports = await Promise.all(
    trips.map(async (trip) => {
      const [totalSeats, bookedSeats, heldSeats, bookingCount] =
        await Promise.all([
          TripSeat.countDocuments({
            tripId: trip._id,
          }),

          TripSeat.countDocuments({
            tripId: trip._id,
            status: "booked",
          }),

          TripSeat.countDocuments({
            tripId: trip._id,
            status: "held",
            holdUntil: { $gt: new Date() },
          }),

          Booking.countDocuments({
            tripId: trip._id,
            status: "confirmed",
          }),
        ]);

      const occupancyPercentage =
        totalSeats > 0
          ? Number(((bookedSeats / totalSeats) * 100).toFixed(2))
          : 0;

      return {
        tripId: trip._id,
        route: trip.routeId,
        bus: trip.busId,
        departureAt: trip.departureAt,
        arrivalAt: trip.arrivalAt,
        status: trip.status,
        fare: trip.fare,
        currency: trip.currency,

        totalSeats,
        bookedSeats,
        heldSeats,
        availableSeats: Math.max(
          0,
          totalSeats - bookedSeats - heldSeats
        ),

        bookingCount,
        occupancyPercentage,
      };
    })
  );

  return {
    trips: reports,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOperatorDashboardSummary = async (
  user,
  query
) => {
  const operatorFilter = getOperatorFilter(
    user,
    query.operatorId
  );

  const dateFilter = buildDateFilter(
    query.startDate,
    query.endDate
  );

  const tripFilter = {
    ...operatorFilter,
    ...dateFilter,
  };

  const bookingFilter = {
    ...operatorFilter,
  };

  if (query.startDate || query.endDate) {
    bookingFilter.bookedAt = {};

    if (query.startDate) {
      bookingFilter.bookedAt.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      bookingFilter.bookedAt.$lte = new Date(query.endDate);
    }
  }

  const [
    totalTrips,
    scheduledTrips,
    completedTrips,
    cancelledTrips,
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    revenueResult,
  ] = await Promise.all([
    Trip.countDocuments(tripFilter),

    Trip.countDocuments({
      ...tripFilter,
      status: "scheduled",
    }),

    Trip.countDocuments({
      ...tripFilter,
      status: "completed",
    }),

    Trip.countDocuments({
      ...tripFilter,
      status: "cancelled",
    }),

    Booking.countDocuments(bookingFilter),

    Booking.countDocuments({
      ...bookingFilter,
      status: "confirmed",
    }),

    Booking.countDocuments({
      ...bookingFilter,
      status: "cancelled",
    }),

    Booking.aggregate([
      {
        $match: {
          ...bookingFilter,
          status: "confirmed",
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
          paidBookings: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  return {
    trips: {
      total: totalTrips,
      scheduled: scheduledTrips,
      completed: completedTrips,
      cancelled: cancelledTrips,
    },

    bookings: {
      total: totalBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
    },

    revenue: {
      total: revenueResult[0]?.totalRevenue || 0,
      paidBookings: revenueResult[0]?.paidBookings || 0,
      currency: "INR",
    },
  };
};

export const getTripPassengerManifest = async (
  user,
  tripId,
  query
) => {
  if (!mongoose.isValidObjectId(tripId)) {
    throw new ApiError(400, "Invalid trip ID");
  }

  const operatorFilter = getOperatorFilter(user);

  const trip = await Trip.findOne({
    _id: tripId,
    ...operatorFilter,
  })
    .populate("routeId")
    .populate("busId", "registrationNumber busName busType")
    .lean();

  if (!trip) {
    throw new ApiError(404, "Trip not found");
  }

  const bookingFilter = {
    tripId: trip._id,
    status: "confirmed",
  };

  const bookings = await Booking.find(bookingFilter)
    .select(
      "pnr userId passengers journey totalAmount paymentStatus bookedAt"
    )
    .populate("userId", "name email phone")
    .sort({ bookedAt: 1 })
    .lean();

  let passengers = bookings.flatMap((booking) =>
    booking.passengers.map((passenger) => ({
      pnr: booking.pnr,
      passengerName: passenger.name,
      age: passenger.age,
      gender: passenger.gender,
      seatNumber: passenger.seatNumber,
      fare: passenger.fare,
      paymentStatus: booking.paymentStatus,
      bookedAt: booking.bookedAt,
      contactName: booking.userId?.name || null,
      contactEmail: booking.userId?.email || null,
      contactPhone: booking.userId?.phone || null,
    }))
  );

  if (query.search) {
    const search = query.search.toLowerCase();

    passengers = passengers.filter((passenger) =>
      [
        passenger.pnr,
        passenger.passengerName,
        passenger.seatNumber,
        passenger.contactEmail,
      ].some((value) =>
        String(value || "").toLowerCase().includes(search)
      )
    );
  }

  const total = passengers.length;
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const paginatedPassengers = passengers.slice(
    skip,
    skip + limit
  );

  const [totalSeats, bookedSeats] = await Promise.all([
    TripSeat.countDocuments({
      tripId: trip._id,
    }),

    TripSeat.countDocuments({
      tripId: trip._id,
      status: "booked",
    }),
  ]);

  return {
    trip: {
      tripId: trip._id,
      route: trip.routeId,
      bus: trip.busId,
      departureAt: trip.departureAt,
      arrivalAt: trip.arrivalAt,
      status: trip.status,
    },

    occupancy: {
      totalSeats,
      bookedSeats,
      availableSeats: Math.max(0, totalSeats - bookedSeats),
      percentage:
        totalSeats > 0
          ? Number(((bookedSeats / totalSeats) * 100).toFixed(2))
          : 0,
    },

    passengers: paginatedPassengers,

    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
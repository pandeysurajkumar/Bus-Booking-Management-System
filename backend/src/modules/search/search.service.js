import mongoose from "mongoose";

import Trip from "../trips/trip.model.js";
import Stop from "../stops/stop.model.js";

import ApiError from "../../utils/ApiError.js";

export const searchTrips = async (query) => {
  const {
    originStopId,
    destinationStopId,
    date,
    busType,
    minFare,
    maxFare,
    sortBy = "departure",
    order = "asc",
    page = 1,
    limit = 10,
  } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50);

  if (
    !mongoose.isValidObjectId(originStopId) ||
    !mongoose.isValidObjectId(destinationStopId)
  ) {
    throw new ApiError(400, "Invalid stop ID.");
  }

  const [originStop, destinationStop] = await Promise.all([
    Stop.findOne({ _id: originStopId, status: "active" }),
    Stop.findOne({ _id: destinationStopId, status: "active" }),
  ]);

  if (!originStop || !destinationStop) {
    throw new ApiError(404, "Origin or destination stop not found.");
  }

  const startDate = new Date(`${date}T00:00:00.000Z`);
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 1);

  const tripFilter = {
    departureAt: {
      $gte: startDate,
      $lt: endDate,
    },

    status: "scheduled",

    availableSeats: { $gt: 0 },
  };

  if (minFare !== undefined || maxFare !== undefined) {
    tripFilter.fare = {};

    if (minFare !== undefined) {
      tripFilter.fare.$gte = minFare;
    }

    if (maxFare !== undefined) {
      tripFilter.fare.$lte = maxFare;
    }
  }

  const trips = await Trip.find(tripFilter)
    .populate({
      path: "routeId",
      populate: [
        {
          path: "originStopId",
          select: "name city state",
        },
        {
          path: "destinationStopId",
          select: "name city state",
        },
        {
          path: "stops.stopId",
          select: "name city state",
        },
      ],
    })
    .populate({
      path: "busId",
      select: "busName registrationNumber busType amenities seatLayout",
    })
    .populate("operatorId", "companyName")
    .lean();

  const matchingTrips = [];

  for (const trip of trips) {
    if (!trip.routeId || !trip.busId) continue;

    if (busType && trip.busId.busType !== busType) {
      continue;
    }

    const routeStops = [...trip.routeId.stops].sort(
      (a, b) => a.sequence - b.sequence
    );

    const originIndex = routeStops.findIndex(
      (item) =>
        item.stopId?._id?.toString() === originStopId
    );

    const destinationIndex = routeStops.findIndex(
      (item) =>
        item.stopId?._id?.toString() === destinationStopId
    );

    if (
      originIndex === -1 ||
      destinationIndex === -1 ||
      originIndex >= destinationIndex
    ) {
      continue;
    }

    const originRouteStop = routeStops[originIndex];
    const destinationRouteStop = routeStops[destinationIndex];

    const originOffset =
      originRouteStop.departureOffsetMinutes ??
      originRouteStop.arrivalOffsetMinutes ??
      0;

    const destinationOffset =
      destinationRouteStop.arrivalOffsetMinutes ??
      destinationRouteStop.departureOffsetMinutes ??
      0;

    const departureAt = new Date(
      new Date(trip.departureAt).getTime() +
      originOffset * 60000
    );

    const arrivalAt = new Date(
      new Date(trip.departureAt).getTime() +
      destinationOffset * 60000
    );

    if (arrivalAt <= departureAt) continue;

    matchingTrips.push({
      _id: trip._id,
      pnr: undefined,

      operator: trip.operatorId?.companyName ?? "Unknown Operator",

      routeName: trip.routeId.routeName,

      origin: {
        stopId: originStop._id,
        name: originStop.name,
        city: originStop.city,
      },

      destination: {
        stopId: destinationStop._id,
        name: destinationStop.name,
        city: destinationStop.city,
      },

      departureAt,
      arrivalAt,

      durationMinutes: Math.round(
        (arrivalAt.getTime() - departureAt.getTime()) / 60000
      ),

      fare: trip.fare,
      currency: trip.currency,

      availableSeats: trip.availableSeats,

      bus: {
        name: trip.busId.busName,
        type: trip.busId.busType,
        amenities: trip.busId.amenities,
      },
    });
  }

  const sortFields = {
    departure: "departureAt",
    arrival: "arrivalAt",
    fare: "fare",
    duration: "durationMinutes",
  };

  const sortField = sortFields[sortBy];
  const direction = order === "asc" ? 1 : -1;

  matchingTrips.sort((a, b) => {
    return (
      (new Date(a[sortField]).getTime() -
        new Date(b[sortField]).getTime()) * direction
    );
  });

  const total = matchingTrips.length;
  const startIndex = (pageNumber - 1) * pageSize;

  return {
    trips: matchingTrips.slice(startIndex, startIndex + pageSize),

    search: {
      origin: originStop.name,
      destination: destinationStop.name,
      date,
    },

    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
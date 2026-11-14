const {
  Trip,
  TripSeat,
  Bus,
  Route,
  City,
  State,
  Operator
} = require('../models');
const { SEAT_STATUS } = require('../config/constants');
const { releaseExpiredLocks } = require('./seatLockService');

/**
 * Searches trips matching source, destination, date, and multiple filters.
 */
const searchTrips = async (filters) => {
  await releaseExpiredLocks();

  const {
    fromCity,
    toCity,
    fromState,
    toState,
    date,
    busType,
    hasAc,
    hasSleeper,
    operatorId,
    sortBy = 'departure_asc',
    page = 1,
    limit = 20
  } = filters;

  // 1. Resolve Route IDs
  const routeQuery = { isActive: true };

  // Resolve cities if names passed
  if (fromCity) {
    const originCityDoc = await City.findOne({ name: new RegExp(`^${fromCity}$`, 'i') });
    if (originCityDoc) routeQuery.originCityId = originCityDoc._id;
  }
  if (toCity) {
    const destCityDoc = await City.findOne({ name: new RegExp(`^${toCity}$`, 'i') });
    if (destCityDoc) routeQuery.destinationCityId = destCityDoc._id;
  }
  if (fromState) {
    const originStateDoc = await State.findOne({ name: new RegExp(`^${fromState}$`, 'i') });
    if (originStateDoc) routeQuery.originStateId = originStateDoc._id;
  }
  if (toState) {
    const destStateDoc = await State.findOne({ name: new RegExp(`^${toState}$`, 'i') });
    if (destStateDoc) routeQuery.destinationStateId = destStateDoc._id;
  }

  const matchingRoutes = await Route.find(routeQuery).select('_id');
  const routeIds = matchingRoutes.map((r) => r._id);

  // 2. Build Trip Query
  const tripQuery = {
    status: 'scheduled',
    isActive: true
  };

  if (routeIds.length > 0) {
    tripQuery.routeId = { $in: routeIds };
  } else if (fromCity || toCity || fromState || toState) {
    // Searched for specific locations but route didn't match
    return { trips: [], total: 0, page: Number(page), totalPages: 0 };
  }

  if (operatorId) {
    tripQuery.operatorId = operatorId;
  }

  // Journey Date Filter (match whole day UTC / IST)
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    tripQuery.departureDate = { $gte: startOfDay, $lte: endOfDay };
  } else {
    // If no date specified, show trips scheduled for today and future
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    tripQuery.departureDate = { $gte: now };
  }

  // 3. Sorting
  const sortMap = {
    fare_asc: { baseFare: 1 },
    fare_desc: { baseFare: -1 },
    departure_asc: { departureTime: 1 },
    departure_desc: { departureTime: -1 }
  };
  const sortOption = sortMap[sortBy] || { departureTime: 1 };

  const skip = (Number(page) - 1) * Number(limit);

  // Query trips with populated bus, operator, route
  let trips = await Trip.find(tripQuery)
    .populate({
      path: 'busId',
      match: {
        ...(busType ? { busType: new RegExp(busType, 'i') } : {}),
        ...(hasAc === 'true' ? { 'amenities.hasAc': true } : {}),
        ...(hasAc === 'false' ? { 'amenities.hasAc': false } : {}),
        ...(hasSleeper === 'true' ? { layoutType: { $in: ['sleeper', 'mixed'] } } : {})
      }
    })
    .populate('operatorId')
    .populate({
      path: 'routeId',
      populate: [
        { path: 'originCityId', select: 'name code' },
        { path: 'destinationCityId', select: 'name code' },
        { path: 'originStateId', select: 'name code' },
        { path: 'destinationStateId', select: 'name code' }
      ]
    })
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  // Filter out any where busId became null due to bus populate match
  trips = trips.filter((t) => t.busId !== null);

  const total = await Trip.countDocuments(tripQuery);

  return {
    trips,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit))
  };
};

/**
 * Gets a trip by ID with all details.
 */
const getTripById = async (id) => {
  await releaseExpiredLocks(id);

  const trip = await Trip.findById(id)
    .populate('busId')
    .populate('operatorId')
    .populate({
      path: 'routeId',
      populate: [
        { path: 'originCityId', select: 'name code' },
        { path: 'destinationCityId', select: 'name code' },
        { path: 'originStateId', select: 'name code' },
        { path: 'destinationStateId', select: 'name code' }
      ]
    });

  if (!trip) {
    const err = new Error('Trip not found');
    err.statusCode = 404;
    throw err;
  }

  return trip;
};

/**
 * Schedules a new trip and generates its individual TripSeat documents based on bus layout.
 */
const createTrip = async (tripData) => {
  const bus = await Bus.findById(tripData.busId);
  if (!bus) {
    const err = new Error('Bus not found');
    err.statusCode = 404;
    throw err;
  }

  const trip = await Trip.create({
    ...tripData,
    totalSeats: bus.totalSeats,
    availableSeats: bus.totalSeats
  });

  // Generate TripSeats from bus.seatLayout
  const seatsToCreate = (bus.seatLayout || []).map((layoutSeat) => {
    const multiplier = layoutSeat.priceMultiplier || 1.0;
    const seatFare = Math.round(tripData.baseFare * multiplier);

    return {
      tripId: trip._id,
      seatNumber: layoutSeat.seatNumber,
      deck: layoutSeat.deck || 'lower',
      seatType: layoutSeat.seatType || 'seater',
      row: layoutSeat.row,
      column: layoutSeat.column,
      fare: seatFare,
      status: SEAT_STATUS.AVAILABLE
    };
  });

  if (seatsToCreate.length > 0) {
    await TripSeat.insertMany(seatsToCreate);
  }

  return await getTripById(trip._id);
};

module.exports = {
  searchTrips,
  getTripById,
  createTrip
};

const mongoose = require('mongoose');
const {
  User,
  Operator,
  Bus,
  Route,
  Trip,
  Booking,
  Cancellation,
  TripSeat
} = require('../models');
const { BOOKING_STATUS, ROLES } = require('../config/constants');

/**
 * Aggregates high-level metrics and time-series data for Admin.
 */
const getAdminAnalytics = async () => {
  const [
    totalCustomers,
    totalOperators,
    totalBuses,
    totalRoutes,
    totalTrips,
    bookingStats,
    revenueData,
    occupancyData,
    monthlyTrends,
    routePerformance
  ] = await Promise.all([
    User.countDocuments({ role: ROLES.CUSTOMER }),
    Operator.countDocuments({ isActive: true }),
    Bus.countDocuments({ isActive: true }),
    Route.countDocuments({ isActive: true }),
    Trip.countDocuments({ isActive: true }),

    // Booking counts by status
    Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]),

    // Confirmed simulated revenue
    Booking.aggregate([
      { $match: { status: BOOKING_STATUS.CONFIRMED } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalTicketsSold: { $sum: '$passengerCount' }
        }
      }
    ]),

    // Overall Seat Occupancy
    TripSeat.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),

    // Daily booking trends for the last 14 days
    Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          bookings: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', BOOKING_STATUS.CONFIRMED] }, '$totalAmount', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Route performance (top routes by bookings)
    Booking.aggregate([
      {
        $group: {
          _id: '$routeId',
          totalBookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          seatsSold: { $sum: '$passengerCount' }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'routes',
          localField: '_id',
          foreignField: '_id',
          as: 'route'
        }
      },
      { $unwind: { path: '$route', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          routeName: '$route.title',
          totalBookings: 1,
          revenue: 1,
          seatsSold: 1
        }
      }
    ])
  ]);

  const bookingCounts = {
    total: 0,
    confirmed: 0,
    cancelled: 0,
    pending: 0
  };
  bookingStats.forEach((stat) => {
    bookingCounts[stat._id] = stat.count;
    bookingCounts.total += stat.count;
  });

  const totalRevenue = revenueData[0]?.totalRevenue || 0;
  const totalTicketsSold = revenueData[0]?.totalTicketsSold || 0;

  let totalSeatsInSystem = 0;
  let bookedSeatsInSystem = 0;
  occupancyData.forEach((item) => {
    totalSeatsInSystem += item.count;
    if (item._id === 'booked') bookedSeatsInSystem += item.count;
  });
  const systemOccupancyRate = totalSeatsInSystem > 0
    ? Math.round((bookedSeatsInSystem / totalSeatsInSystem) * 100)
    : 0;

  return {
    counts: {
      customers: totalCustomers,
      operators: totalOperators,
      buses: totalBuses,
      routes: totalRoutes,
      trips: totalTrips
    },
    bookings: bookingCounts,
    revenue: {
      totalRevenue,
      totalTicketsSold
    },
    occupancy: {
      rate: systemOccupancyRate,
      bookedSeats: bookedSeatsInSystem,
      totalSeats: totalSeatsInSystem
    },
    dailyTrends: monthlyTrends.map((t) => ({ date: t._id, bookings: t.bookings, revenue: t.revenue })),
    routePerformance
  };
};

/**
 * Aggregates operator-specific metrics, manifests, and occupancy.
 */
const getOperatorAnalytics = async (operatorId) => {
  const opObjectId = new mongoose.Types.ObjectId(operatorId);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    assignedBuses,
    activeTrips,
    todayTrips,
    bookingStats,
    todayBookings,
    cancellationsCount
  ] = await Promise.all([
    Bus.countDocuments({ operatorId: opObjectId, isActive: true }),
    Trip.countDocuments({ operatorId: opObjectId, status: 'scheduled' }),
    Trip.find({
      operatorId: opObjectId,
      departureDate: { $gte: todayStart, $lte: todayEnd }
    }).populate('busId routeId'),
    Booking.aggregate([
      { $match: { operatorId: opObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', BOOKING_STATUS.CONFIRMED] }, '$totalAmount', 0]
            }
          },
          passengersCount: {
            $sum: {
              $cond: [{ $eq: ['$status', BOOKING_STATUS.CONFIRMED] }, '$passengerCount', 0]
            }
          }
        }
      }
    ]),
    Booking.find({
      operatorId: opObjectId,
      journeyDate: { $gte: todayStart, $lte: todayEnd }
    })
      .populate('passengers')
      .populate('busId', 'busNumber modelName')
      .populate('routeId', 'title'),
    Cancellation.countDocuments({
      bookingId: {
        $in: await Booking.find({ operatorId: opObjectId }).distinct('_id')
      }
    })
  ]);

  let totalRevenue = 0;
  let confirmedBookings = 0;
  let cancelledBookings = 0;
  let confirmedPassengers = 0;

  bookingStats.forEach((s) => {
    if (s._id === BOOKING_STATUS.CONFIRMED) {
      confirmedBookings = s.count;
      totalRevenue = s.totalAmount;
      confirmedPassengers = s.passengersCount;
    } else if (s._id === BOOKING_STATUS.CANCELLED) {
      cancelledBookings = s.count;
    }
  });

  return {
    assignedBuses,
    activeTrips,
    todaySchedules: todayTrips,
    todayBookings,
    confirmedBookings,
    cancelledBookings,
    totalCancellations: cancellationsCount,
    totalRevenue,
    confirmedPassengers
  };
};

/**
 * Passenger manifest reconciliation for an operator's trip.
 */
const getTripManifest = async (tripId) => {
  const trip = await Trip.findById(tripId).populate('busId routeId operatorId');
  if (!trip) {
    const err = new Error('Trip not found');
    err.statusCode = 404;
    throw err;
  }

  const confirmedBookings = await Booking.find({
    tripId,
    status: BOOKING_STATUS.CONFIRMED
  }).populate('passengers userId');

  const passengersList = [];
  confirmedBookings.forEach((b) => {
    (b.passengers || []).forEach((p) => {
      passengersList.push({
        passengerId: p._id,
        pnr: b.pnr,
        name: p.fullName,
        age: p.age,
        gender: p.gender,
        seatNumber: p.seatNumber,
        boardingPoint: b.boardingPoint?.name,
        boardingTime: b.boardingPoint?.time,
        dropPoint: b.dropPoint?.name,
        contactPhone: b.contactInfo?.phone,
        bookedAt: b.createdAt
      });
    });
  });

  // Sort passengers by seat number
  passengersList.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true }));

  const occupiedSeatsCount = passengersList.length;
  const occupancyPercentage = trip.totalSeats > 0 ? Math.round((occupiedSeatsCount / trip.totalSeats) * 100) : 0;

  return {
    trip,
    passengers: passengersList,
    reconciliation: {
      totalSeats: trip.totalSeats,
      availableSeats: trip.availableSeats,
      occupiedSeats: occupiedSeatsCount,
      occupancyPercentage,
      totalConfirmedBookings: confirmedBookings.length
    }
  };
};

module.exports = {
  getAdminAnalytics,
  getOperatorAnalytics,
  getTripManifest
};

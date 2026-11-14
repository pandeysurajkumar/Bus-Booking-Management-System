const {
  Booking,
  Passenger,
  Payment,
  Trip,
  TripSeat,
  SeatLock
} = require('../models');
const { BOOKING_STATUS, SEAT_STATUS } = require('../config/constants');
const { generatePNR } = require('../utils/pnrGenerator');
const { recordAuditLog } = require('../utils/auditLogger');
const paymentService = require('./paymentService');
const { withTransaction } = require('../utils/transaction');

/**
 * Calculates server-side fare for given seats on a trip.
 */
const calculateFare = async (tripId, seatNumbers) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    const err = new Error('Trip not found');
    err.statusCode = 404;
    throw err;
  }

  const seats = await TripSeat.find({ tripId, seatNumber: { $in: seatNumbers } });
  if (seats.length !== seatNumbers.length) {
    const err = new Error('One or more selected seats do not exist on this trip');
    err.statusCode = 400;
    throw err;
  }

  const baseAmount = seats.reduce((sum, s) => sum + s.fare, 0);
  const taxAmount = Math.round(baseAmount * 0.05); // 5% GST
  const discountAmount = 0;
  const totalAmount = baseAmount + taxAmount - discountAmount;

  return {
    baseAmount,
    taxAmount,
    discountAmount,
    totalAmount,
    seatsBreakdown: seats.map((s) => ({ seatNumber: s.seatNumber, fare: s.fare, seatType: s.seatType }))
  };
};

/**
 * Creates a confirmed booking with simulated payment.
 */
const createBooking = async ({
  userId,
  tripId,
  seats,
  passengers,
  boardingPoint,
  dropPoint,
  contactInfo,
  paymentMethod,
  simulatedSuccess = true,
  idempotencyKey = null,
  req = null
}) => {
  // Idempotency check: if request was already processed, return existing booking
  if (idempotencyKey) {
    const existingBooking = await Booking.findOne({ idempotencyKey })
      .populate('passengers paymentId busId operatorId routeId');
    if (existingBooking) {
      return { booking: existingBooking, isDuplicate: true };
    }
  }

  // 1. Validate passenger count matches selected seats
  if (passengers.length !== seats.length) {
    const err = new Error(`Number of passengers (${passengers.length}) must match selected seats (${seats.length})`);
    err.statusCode = 400;
    throw err;
  }

  // Validate passenger seat numbers match selected seats
  const passengerSeats = passengers.map((p) => p.seatNumber).sort();
  const sortedSelected = [...seats].sort();
  if (JSON.stringify(passengerSeats) !== JSON.stringify(sortedSelected)) {
    const err = new Error('Passenger seat assignments must match the selected seats');
    err.statusCode = 400;
    throw err;
  }

  // 2. Fetch Trip
  const trip = await Trip.findById(tripId);
  if (!trip || trip.status !== 'scheduled') {
    const err = new Error('Trip is not available for booking');
    err.statusCode = 400;
    throw err;
  }

  // 3. Server-side Fare Calculation
  const { baseAmount, taxAmount, discountAmount, totalAmount } = await calculateFare(tripId, seats);

  // 4. Verify that all seats are either currently locked by this user OR available
  const now = new Date();
  const tripSeats = await TripSeat.find({ tripId, seatNumber: { $in: seats } });

  for (const s of tripSeats) {
    if (s.status === SEAT_STATUS.BOOKED) {
      const err = new Error(`Seat ${s.seatNumber} has already been booked`);
      err.statusCode = 409;
      throw err;
    }
    if (s.status === SEAT_STATUS.LOCKED) {
      const isLockedBySelf = s.lockedBy && s.lockedBy.toString() === userId.toString();
      const isExpired = s.lockExpiresAt && s.lockExpiresAt < now;
      if (!isLockedBySelf && !isExpired) {
        const err = new Error(`Seat ${s.seatNumber} is currently locked by another customer`);
        err.statusCode = 409;
        throw err;
      }
    }
  }

  // 5. Process Simulated Payment
  const paymentResult = await paymentService.processPayment({
    amount: totalAmount,
    paymentMethod,
    simulatedSuccess
  });

  if (paymentResult.status !== 'success') {
    // Payment failed: create failed payment record & throw error
    const failedPayment = await Payment.create({
      bookingId: null,
      transactionId: paymentResult.transactionId,
      paymentMethod,
      amount: totalAmount,
      status: paymentResult.status,
      gatewayResponse: paymentResult.gatewayResponse
    });

    const err = new Error('Payment processing failed. Please verify payment details and try again.');
    err.statusCode = 402;
    err.paymentId = failedPayment._id;
    throw err;
  }

  // 6. Confirmed Booking Creation within Transaction / Atomic Batch
  const pnr = generatePNR();

  const confirmedBooking = await withTransaction(async (session) => {
    const opts = session ? { session } : {};

    // Create Booking instance
    const [booking] = await Booking.create(
      [
        {
          pnr,
          userId,
          tripId,
          operatorId: trip.operatorId,
          busId: trip.busId,
          routeId: trip.routeId,
          journeyDate: trip.departureDate,
          seats,
          passengerCount: passengers.length,
          contactInfo,
          boardingPoint,
          dropPoint,
          baseAmount,
          taxAmount,
          discountAmount,
          totalAmount,
          status: BOOKING_STATUS.CONFIRMED,
          idempotencyKey: idempotencyKey || undefined
        }
      ],
      opts
    );

    // Create Passenger documents
    const passengerDocs = passengers.map((p) => ({
      bookingId: booking._id,
      fullName: p.fullName,
      age: p.age,
      gender: p.gender,
      seatNumber: p.seatNumber
    }));
    const createdPassengers = await Passenger.insertMany(passengerDocs, opts);

    // Create Payment Document
    const [paymentDoc] = await Payment.create(
      [
        {
          bookingId: booking._id,
          transactionId: paymentResult.transactionId,
          paymentMethod,
          amount: totalAmount,
          status: paymentResult.status,
          paidAt: paymentResult.paidAt,
          methodDetails: paymentResult.methodDetails,
          gatewayResponse: paymentResult.gatewayResponse
        }
      ],
      opts
    );

    // Update Booking references
    booking.passengers = createdPassengers.map((p) => p._id);
    booking.paymentId = paymentDoc._id;
    await booking.save(opts);

    // Atomically update TripSeats to BOOKED
    await TripSeat.updateMany(
      { tripId, seatNumber: { $in: seats } },
      {
        $set: {
          status: SEAT_STATUS.BOOKED,
          bookingId: booking._id,
          lockedBy: null,
          lockExpiresAt: null
        }
      },
      opts
    );

    // Decrement availableSeats on Trip
    await Trip.findByIdAndUpdate(
      tripId,
      { $inc: { availableSeats: -seats.length } },
      opts
    );

    // Clean up SeatLock
    await SeatLock.deleteOne({ tripId, userId }, opts);

    return booking;
  });

  await recordAuditLog({
    userId,
    action: 'BOOKING_CONFIRMED',
    resource: 'Booking',
    resourceId: confirmedBooking._id,
    details: { pnr, seats, totalAmount, tripId },
    req
  });

  // Re-fetch populated booking
  const populated = await Booking.findById(confirmedBooking._id)
    .populate('passengers')
    .populate('paymentId')
    .populate('busId')
    .populate('operatorId')
    .populate('routeId');

  return { booking: populated, isDuplicate: false };
};

/**
 * Retrieves booking by unique PNR.
 */
const getBookingByPNR = async (pnr) => {
  const booking = await Booking.findOne({ pnr: pnr.toUpperCase() })
    .populate('passengers')
    .populate('paymentId')
    .populate('busId')
    .populate('operatorId')
    .populate('routeId')
    .populate('userId', 'name email phone');

  if (!booking) {
    const err = new Error('Booking not found with this PNR');
    err.statusCode = 404;
    throw err;
  }
  return booking;
};

/**
 * Retrieves booking history for a user.
 */
const getUserBookings = async (userId) => {
  return await Booking.find({ userId })
    .populate('passengers')
    .populate('paymentId')
    .populate('busId')
    .populate('operatorId')
    .populate('routeId')
    .sort({ createdAt: -1 });
};

module.exports = {
  calculateFare,
  createBooking,
  getBookingByPNR,
  getUserBookings
};

const {
  Booking,
  Cancellation,
  Refund,
  TripSeat,
  Trip,
  CancellationPolicy
} = require('../models');
const { BOOKING_STATUS, SEAT_STATUS, REFUND_POLICY_DEFAULT } = require('../config/constants');
const { generateTransactionId } = require('../utils/pnrGenerator');
const { recordAuditLog } = require('../utils/auditLogger');
const { withTransaction } = require('../utils/transaction');
const paymentService = require('./paymentService');

/**
 * Calculates refund estimate based on hours until departure.
 * @param {Object} booking
 * @returns {Object}
 */
const calculateRefundDetails = async (booking) => {
  const now = new Date();
  const departureDate = booking.boardingPoint?.time
    ? new Date(booking.boardingPoint.time)
    : new Date(booking.journeyDate);

  const diffMs = departureDate.getTime() - now.getTime();
  const hoursUntilDeparture = diffMs / (1000 * 60 * 60);

  // Fetch policy or use default
  let rules = REFUND_POLICY_DEFAULT;
  const policy = await CancellationPolicy.findOne({ isDefault: true, isActive: true });
  if (policy && policy.rules && policy.rules.length > 0) {
    rules = policy.rules;
  }

  // Sort descending by minHours
  const sortedRules = [...rules].sort((a, b) => b.minHoursBeforeDeparture - a.minHoursBeforeDeparture);

  let selectedRule = { minHoursBeforeDeparture: 0, refundPercentage: 0, cancellationFeePercentage: 100 };
  for (const rule of sortedRules) {
    if (hoursUntilDeparture >= rule.minHoursBeforeDeparture) {
      selectedRule = rule;
      break;
    }
  }

  const refundPercentage = selectedRule.refundPercentage;
  const originalAmount = booking.totalAmount;
  const refundAmount = Math.round((originalAmount * refundPercentage) / 100);
  const cancellationFee = originalAmount - refundAmount;

  return {
    hoursUntilDeparture: Math.max(0, parseFloat(hoursUntilDeparture.toFixed(1))),
    refundPercentage,
    cancellationFeePercentage: selectedRule.cancellationFeePercentage,
    originalAmount,
    refundAmount,
    cancellationFee,
    ruleDescription: selectedRule.description || `${refundPercentage}% refund`
  };
};

/**
 * Cancels a confirmed booking and initiates a simulated refund.
 */
const cancelBooking = async (bookingId, userId, reason = 'Customer requested cancellation', req = null) => {
  const booking = await Booking.findById(bookingId).populate('paymentId tripId');
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    const err = new Error(`Cannot cancel a booking that is currently ${booking.status}`);
    err.statusCode = 400;
    throw err;
  }

  // Check ownership unless admin/operator
  if (req && req.user && req.user.role === 'customer' && booking.userId.toString() !== userId.toString()) {
    const err = new Error('Unauthorized to cancel this booking');
    err.statusCode = 403;
    throw err;
  }

  // Calculate refund
  const refundCalc = await calculateRefundDetails(booking);

  // Call simulated payment refund service
  const refundResult = await paymentService.processRefund({
    refundAmount: refundCalc.refundAmount,
    originalTransactionId: booking.paymentId?.transactionId || 'ORIG_TXN'
  });

  const cancelledSeatsCount = booking.seats.length;

  const result = await withTransaction(async (session) => {
    const opts = session ? { session } : {};

    // 1. Mark booking as cancelled
    booking.status = BOOKING_STATUS.CANCELLED;

    // 2. Create Cancellation Record
    const [cancellation] = await Cancellation.create(
      [
        {
          bookingId: booking._id,
          userId,
          reason,
          cancelledSeats: booking.seats,
          originalAmount: refundCalc.originalAmount,
          refundAmount: refundCalc.refundAmount,
          cancellationFee: refundCalc.cancellationFee,
          refundPercentage: refundCalc.refundPercentage,
          status: 'completed'
        }
      ],
      opts
    );

    // 3. Create Refund Record
    const [refund] = await Refund.create(
      [
        {
          cancellationId: cancellation._id,
          bookingId: booking._id,
          paymentId: booking.paymentId?._id || null,
          refundAmount: refundCalc.refundAmount,
          refundTransactionId: refundResult.refundTransactionId,
          status: 'completed',
          notes: `Simulated refund of Rs. ${refundCalc.refundAmount} (${refundCalc.refundPercentage}%) credited to source`
        }
      ],
      opts
    );

    booking.cancellationId = cancellation._id;
    await booking.save(opts);

    // 4. Release seats back to AVAILABLE
    await TripSeat.updateMany(
      { tripId: booking.tripId, seatNumber: { $in: booking.seats } },
      {
        $set: {
          status: SEAT_STATUS.AVAILABLE,
          bookingId: null,
          lockedBy: null,
          lockExpiresAt: null
        }
      },
      opts
    );

    // 5. Restore Trip availableSeats inventory
    await Trip.findByIdAndUpdate(
      booking.tripId,
      { $inc: { availableSeats: cancelledSeatsCount } },
      opts
    );

    return { booking, cancellation, refund };
  });

  await recordAuditLog({
    userId,
    action: 'BOOKING_CANCELLED',
    resource: 'Booking',
    resourceId: bookingId,
    details: {
      pnr: booking.pnr,
      refundAmount: refundCalc.refundAmount,
      seats: booking.seats
    },
    req
  });

  return {
    success: true,
    message: 'Booking cancelled successfully and refund processed',
    cancellation: result.cancellation,
    refund: result.refund,
    booking: result.booking
  };
};

module.exports = {
  calculateRefundDetails,
  cancelBooking
};

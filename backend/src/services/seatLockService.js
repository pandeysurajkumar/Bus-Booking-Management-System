const { TripSeat, SeatLock, Trip } = require('../models');
const { SEAT_STATUS } = require('../config/constants');
const { recordAuditLog } = require('../utils/auditLogger');

const LOCK_DURATION_MS = (parseInt(process.env.SEAT_LOCK_DURATION_MINUTES, 10) || 5) * 60 * 1000;

/**
 * Sweeps and unlocks any seats where lockExpiresAt is in the past.
 * @param {string} [tripId] - Optional trip filter
 */
const releaseExpiredLocks = async (tripId = null) => {
  const now = new Date();
  const query = {
    status: SEAT_STATUS.LOCKED,
    lockExpiresAt: { $lt: now }
  };
  if (tripId) query.tripId = tripId;

  const expiredSeats = await TripSeat.find(query);
  if (expiredSeats.length > 0) {
    const seatIds = expiredSeats.map((s) => s._id);
    await TripSeat.updateMany(
      { _id: { $in: seatIds } },
      {
        $set: {
          status: SEAT_STATUS.AVAILABLE,
          lockedBy: null,
          lockExpiresAt: null
        }
      }
    );
  }

  // Also clean up expired SeatLock documents
  await SeatLock.deleteMany({ expiresAt: { $lt: now } });
};

/**
 * Gets all seats for a trip with live status (evaluating locks relative to current user).
 * @param {string} tripId
 * @param {string} [currentUserId]
 */
const getTripSeats = async (tripId, currentUserId = null) => {
  // Always clean expired locks first
  await releaseExpiredLocks(tripId);

  const trip = await Trip.findById(tripId).populate('busId operatorId');
  if (!trip) {
    const err = new Error('Trip not found');
    err.statusCode = 404;
    throw err;
  }

  const seats = await TripSeat.find({ tripId }).sort({ deck: 1, row: 1, column: 1 });

  // Map seats to include user-specific status (e.g. if locked by current user)
  const mappedSeats = seats.map((seat) => {
    const seatObj = seat.toObject();
    const isLockedByCurrentUser =
      currentUserId &&
      seat.status === SEAT_STATUS.LOCKED &&
      seat.lockedBy &&
      seat.lockedBy.toString() === currentUserId.toString();

    return {
      ...seatObj,
      isLockedByCurrentUser: !!isLockedByCurrentUser
    };
  });

  return { trip, seats: mappedSeats };
};

/**
 * Locks one or more seats for 5 minutes atomically.
 * Prevents race conditions and double locking.
 *
 * @param {string} tripId
 * @param {string[]} seatNumbers
 * @param {string} userId
 */
const lockSeats = async (tripId, seatNumbers, userId, req = null) => {
  if (!seatNumbers || seatNumbers.length === 0) {
    const err = new Error('No seats provided to lock');
    err.statusCode = 400;
    throw err;
  }

  const maxSeats = parseInt(process.env.MAX_SEATS_PER_BOOKING, 10) || 6;
  if (seatNumbers.length > maxSeats) {
    const err = new Error(`Cannot select more than ${maxSeats} seats per booking`);
    err.statusCode = 400;
    throw err;
  }

  // Release expired locks first
  await releaseExpiredLocks(tripId);

  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + LOCK_DURATION_MS);
  const lockedInThisBatch = [];

  try {
    for (const seatNumber of seatNumbers) {
      // Atomic find and lock query:
      // A seat is lockable if:
      // 1. status is 'available', OR
      // 2. status is 'locked' but expired, OR
      // 3. status is 'locked' and ALREADY locked by the same user
      const updatedSeat = await TripSeat.findOneAndUpdate(
        {
          tripId,
          seatNumber,
          $or: [
            { status: SEAT_STATUS.AVAILABLE },
            { status: SEAT_STATUS.LOCKED, lockExpiresAt: { $lt: now } },
            { status: SEAT_STATUS.LOCKED, lockedBy: userId }
          ]
        },
        {
          $set: {
            status: SEAT_STATUS.LOCKED,
            lockedBy: userId,
            lockExpiresAt
          }
        },
        { new: true }
      );

      if (!updatedSeat) {
        // Seat was already booked or locked by someone else! Roll back any seats locked in this batch.
        throw new Error(`Seat ${seatNumber} is no longer available or is currently locked by another passenger.`);
      }

      lockedInThisBatch.push(updatedSeat);
    }

    // Upsert the user's SeatLock entry
    await SeatLock.findOneAndUpdate(
      { tripId, userId },
      {
        $set: {
          seatNumbers,
          expiresAt: lockExpiresAt
        }
      },
      { upsert: true, new: true }
    );

    await recordAuditLog({
      userId,
      action: 'SEATS_LOCKED',
      resource: 'TripSeat',
      resourceId: tripId,
      details: { seatNumbers, lockExpiresAt },
      req
    });

    return {
      success: true,
      message: `${seatNumbers.length} seat(s) temporarily locked for 5 minutes`,
      seatNumbers,
      lockExpiresAt
    };
  } catch (error) {
    // Rollback batch if any seat lock failed
    if (lockedInThisBatch.length > 0) {
      const rollbackNumbers = lockedInThisBatch.map((s) => s.seatNumber);
      await TripSeat.updateMany(
        {
          tripId,
          seatNumber: { $in: rollbackNumbers },
          lockedBy: userId
        },
        {
          $set: {
            status: SEAT_STATUS.AVAILABLE,
            lockedBy: null,
            lockExpiresAt: null
          }
        }
      );
    }

    error.statusCode = 409; // Conflict
    throw error;
  }
};

/**
 * Manually release seats locked by the current user.
 * @param {string} tripId
 * @param {string[]} seatNumbers
 * @param {string} userId
 */
const releaseSeats = async (tripId, seatNumbers, userId, req = null) => {
  await TripSeat.updateMany(
    {
      tripId,
      seatNumber: { $in: seatNumbers },
      lockedBy: userId,
      status: SEAT_STATUS.LOCKED
    },
    {
      $set: {
        status: SEAT_STATUS.AVAILABLE,
        lockedBy: null,
        lockExpiresAt: null
      }
    }
  );

  await SeatLock.deleteOne({ tripId, userId });

  await recordAuditLog({
    userId,
    action: 'SEATS_RELEASED',
    resource: 'TripSeat',
    resourceId: tripId,
    details: { seatNumbers },
    req
  });

  return { success: true, message: 'Seats released successfully' };
};

module.exports = {
  releaseExpiredLocks,
  getTripSeats,
  lockSeats,
  releaseSeats
};

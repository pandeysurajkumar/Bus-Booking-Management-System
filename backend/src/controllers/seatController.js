const seatLockService = require('../services/seatLockService');
const bookingService = require('../services/bookingService');

// GET /api/seats/trip/:tripId
const getTripSeats = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const result = await seatLockService.getTripSeats(req.params.tripId, currentUserId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/seats/lock
const lockSeats = async (req, res, next) => {
  try {
    const { tripId, seatNumbers } = req.body;
    const userId = req.user._id;
    const result = await seatLockService.lockSeats(tripId, seatNumbers, userId, req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/seats/release
const releaseSeats = async (req, res, next) => {
  try {
    const { tripId, seatNumbers } = req.body;
    const userId = req.user._id;
    const result = await seatLockService.releaseSeats(tripId, seatNumbers, userId, req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/seats/calculate-fare
const calculateFare = async (req, res, next) => {
  try {
    const { tripId, seatNumbers } = req.body;
    if (!tripId || !seatNumbers || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'tripId and seatNumbers are required' });
    }
    const fareDetails = await bookingService.calculateFare(tripId, seatNumbers);
    res.status(200).json({
      success: true,
      data: fareDetails
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTripSeats,
  lockSeats,
  releaseSeats,
  calculateFare
};

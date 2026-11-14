const cancellationService = require('../services/cancellationService');
const { Booking } = require('../models');

// GET /api/cancellations/estimate/:bookingId
const getRefundEstimate = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const estimate = await cancellationService.calculateRefundDetails(booking);
    res.status(200).json({
      success: true,
      data: estimate
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cancellations
const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId, reason } = req.body;
    const userId = req.user._id;
    const result = await cancellationService.cancelBooking(bookingId, userId, reason, req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRefundEstimate,
  cancelBooking
};

const bookingService = require('../services/bookingService');
const { generateTicketPDF } = require('../utils/pdfTicket');

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const bookingPayload = {
      ...req.body,
      userId: req.user._id,
      idempotencyKey: req.headers['x-idempotency-key'] || req.body.idempotencyKey,
      req
    };

    const result = await bookingService.createBooking(bookingPayload);
    res.status(result.isDuplicate ? 200 : 201).json({
      success: true,
      message: result.isDuplicate ? 'Booking already exists (idempotent replay)' : 'Booking confirmed successfully',
      data: result.booking
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/pnr/:pnr
const getBookingByPNR = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingByPNR(req.params.pnr);
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/my-bookings
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user._id);
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:id/ticket-pdf
const downloadTicketPDF = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingByPNR(req.params.id);
    const pdfBuffer = generateTicketPDF(booking);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Ticket-${booking.pnr}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookingByPNR,
  getMyBookings,
  downloadTicketPDF
};

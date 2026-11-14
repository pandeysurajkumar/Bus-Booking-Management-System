const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createBookingSchema } = require('../validators/bookingValidators');
const { bookingLimiter } = require('../middleware/rateLimiter');

router.post('/', protect, bookingLimiter, validate(createBookingSchema), bookingController.createBooking);
router.get('/my-bookings', protect, bookingController.getMyBookings);
router.get('/pnr/:pnr', bookingController.getBookingByPNR);
router.get('/:id/ticket-pdf', bookingController.downloadTicketPDF);

module.exports = router;

const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');
const { protect, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { lockSeatsSchema, releaseSeatsSchema } = require('../validators/seatLockValidators');
const { bookingLimiter } = require('../middleware/rateLimiter');

router.get('/trip/:tripId', optionalAuth, seatController.getTripSeats);
router.post('/lock', protect, bookingLimiter, validate(lockSeatsSchema), seatController.lockSeats);
router.post('/release', protect, validate(releaseSeatsSchema), seatController.releaseSeats);
router.post('/calculate-fare', seatController.calculateFare);

module.exports = router;

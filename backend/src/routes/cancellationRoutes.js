const express = require('express');
const router = express.Router();
const cancellationController = require('../controllers/cancellationController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { cancelBookingSchema } = require('../validators/cancellationValidators');

router.get('/estimate/:bookingId', protect, cancellationController.getRefundEstimate);
router.post('/', protect, validate(cancelBookingSchema), cancellationController.cancelBooking);

module.exports = router;

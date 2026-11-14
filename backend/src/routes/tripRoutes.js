const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { searchTripsSchema, createTripSchema } = require('../validators/tripValidators');
const { ROLES } = require('../config/constants');

router.get('/', validate(searchTripsSchema, 'query'), tripController.searchTrips);
router.get('/:id', tripController.getTripById);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.OPERATOR), validate(createTripSchema), tripController.createTrip);

module.exports = router;

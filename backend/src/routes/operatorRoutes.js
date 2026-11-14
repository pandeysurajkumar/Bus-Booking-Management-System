const express = require('express');
const router = express.Router();
const operatorController = require('../controllers/operatorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

// Apply Operator or Admin guard
router.use(protect, authorize(ROLES.OPERATOR, ROLES.ADMIN));

router.get('/dashboard', operatorController.getDashboard);
router.get('/buses', operatorController.getMyBuses);
router.get('/trips', operatorController.getMyTrips);
router.get('/manifest/:tripId', operatorController.getManifest);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

// Apply admin guard to all routes in this file
router.use(protect, authorize(ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/operators', adminController.getOperators);
router.patch('/operators/:id/toggle-status', adminController.toggleOperatorStatus);
router.get('/bookings', adminController.getAllBookings);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/cancellation-policy', adminController.getCancellationPolicy);
router.put('/cancellation-policy', adminController.updateCancellationPolicy);

module.exports = router;

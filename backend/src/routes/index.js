const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const locationRoutes = require('./locationRoutes');
const busRoutes = require('./busRoutes');
const routeRoutes = require('./routeRoutes');
const tripRoutes = require('./tripRoutes');
const seatRoutes = require('./seatRoutes');
const bookingRoutes = require('./bookingRoutes');
const cancellationRoutes = require('./cancellationRoutes');
const adminRoutes = require('./adminRoutes');
const operatorRoutes = require('./operatorRoutes');

router.use('/auth', authRoutes);
router.use('/locations', locationRoutes);
router.use('/buses', busRoutes);
router.use('/routes', routeRoutes);
router.use('/trips', tripRoutes);
router.use('/seats', seatRoutes);
router.use('/bookings', bookingRoutes);
router.use('/cancellations', cancellationRoutes);
router.use('/admin', adminRoutes);
router.use('/operator', operatorRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Bus Booking Management System REST API',
    version: '1.0.0'
  });
});

module.exports = router;

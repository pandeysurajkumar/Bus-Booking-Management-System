const { getOperatorAnalytics, getTripManifest } = require('../services/analyticsService');
const { Bus, Trip, Booking } = require('../models');

// Helper to get active operatorId
const resolveOperatorId = (req) => {
  if (req.user.role === 'admin' && req.query.operatorId) {
    return req.query.operatorId;
  }
  return req.user.operatorId;
};

// GET /api/operator/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const operatorId = resolveOperatorId(req);
    if (!operatorId) {
      return res.status(400).json({ success: false, message: 'Operator profile not linked' });
    }
    const data = await getOperatorAnalytics(operatorId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/operator/buses
const getMyBuses = async (req, res, next) => {
  try {
    const operatorId = resolveOperatorId(req);
    const buses = await Bus.find({ operatorId, isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: buses.length, data: buses });
  } catch (error) {
    next(error);
  }
};

// GET /api/operator/trips
const getMyTrips = async (req, res, next) => {
  try {
    const operatorId = resolveOperatorId(req);
    const trips = await Trip.find({ operatorId })
      .populate('busId')
      .populate('routeId')
      .sort({ departureDate: -1 });
    res.status(200).json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    next(error);
  }
};

// GET /api/operator/manifest/:tripId
const getManifest = async (req, res, next) => {
  try {
    const data = await getTripManifest(req.params.tripId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getMyBuses,
  getMyTrips,
  getManifest
};

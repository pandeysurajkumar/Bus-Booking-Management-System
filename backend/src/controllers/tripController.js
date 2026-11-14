const tripService = require('../services/tripService');

// GET /api/trips (Search with filters)
const searchTrips = async (req, res, next) => {
  try {
    const result = await tripService.searchTrips(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id
const getTripById = async (req, res, next) => {
  try {
    const trip = await tripService.getTripById(req.params.id);
    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips (Admin or Operator)
const createTrip = async (req, res, next) => {
  try {
    const tripData = { ...req.body };
    if (req.user.role === 'operator' && req.user.operatorId) {
      tripData.operatorId = req.user.operatorId;
    }
    const trip = await tripService.createTrip(tripData);
    res.status(201).json({
      success: true,
      message: 'Trip scheduled successfully',
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchTrips,
  getTripById,
  createTrip
};

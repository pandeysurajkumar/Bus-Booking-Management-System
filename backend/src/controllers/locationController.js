const { State, City, Stop } = require('../models');

// GET /api/locations/states
const getStates = async (req, res, next) => {
  try {
    const states = await State.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: states.length,
      data: states
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/locations/cities?stateId=...&isPopular=true
const getCities = async (req, res, next) => {
  try {
    const query = { isActive: true };
    if (req.query.stateId) {
      query.stateId = req.query.stateId;
    }
    if (req.query.isPopular === 'true') {
      query.isPopular = true;
    }

    const cities = await City.find(query).populate('stateId', 'name code').sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/locations/stops?cityId=...
const getStops = async (req, res, next) => {
  try {
    const query = { isActive: true };
    if (req.query.cityId) {
      query.cityId = req.query.cityId;
    }
    const stops = await Stop.find(query).populate('cityId', 'name').sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: stops.length,
      data: stops
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStates,
  getCities,
  getStops
};

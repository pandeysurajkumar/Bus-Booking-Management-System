const { Route } = require('../models');

// GET /api/routes
const getRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find({ isActive: true })
      .populate('originCityId destinationCityId originStateId destinationStateId')
      .sort({ title: 1 });
    res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    next(error);
  }
};

// GET /api/routes/popular
const getPopularRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find({ isActive: true })
      .populate('originCityId destinationCityId originStateId destinationStateId')
      .limit(6);
    res.status(200).json({ success: true, data: routes });
  } catch (error) {
    next(error);
  }
};

// POST /api/routes (Admin only)
const createRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, message: 'Route created successfully', data: route });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoutes,
  getPopularRoutes,
  createRoute
};

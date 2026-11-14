const { Bus } = require('../models');

// GET /api/buses
const getBuses = async (req, res, next) => {
  try {
    const query = { isActive: true };
    if (req.query.operatorId) {
      query.operatorId = req.query.operatorId;
    }
    const buses = await Bus.find(query).populate('operatorId').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/buses/:id
const getBusById = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('operatorId');
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }
    res.status(200).json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
};

// POST /api/buses (Admin/Operator)
const createBus = async (req, res, next) => {
  try {
    const busData = { ...req.body };
    if (req.user.role === 'operator' && req.user.operatorId) {
      busData.operatorId = req.user.operatorId;
    }
    const bus = await Bus.create(busData);
    res.status(201).json({ success: true, message: 'Bus registered successfully', data: bus });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBuses,
  getBusById,
  createBus
};

const { getAdminAnalytics } = require('../services/analyticsService');
const {
  User,
  Operator,
  Booking,
  AuditLog,
  CancellationPolicy
} = require('../models');

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const data = await getAdminAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.search) {
      query.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') }
      ];
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/users/:id/toggle-status
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/operators
const getOperators = async (req, res, next) => {
  try {
    const operators = await Operator.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: operators.length, data: operators });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/operators/:id/toggle-status
const toggleOperatorStatus = async (req, res, next) => {
  try {
    const operator = await Operator.findById(req.params.id);
    if (!operator) return res.status(404).json({ success: false, message: 'Operator not found' });
    operator.isActive = !operator.isActive;
    await operator.save();
    res.status(200).json({
      success: true,
      message: `Operator ${operator.isActive ? 'approved/activated' : 'deactivated'} successfully`,
      data: operator
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/bookings
const getAllBookings = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('operatorId', 'companyName')
      .populate('routeId', 'title')
      .populate('paymentId')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.action) query.action = req.query.action;
    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/cancellation-policy
const getCancellationPolicy = async (req, res, next) => {
  try {
    let policy = await CancellationPolicy.findOne({ isDefault: true });
    if (!policy) {
      policy = await CancellationPolicy.create({
        name: 'Standard Railway/Bus Policy',
        description: 'Industry standard tiered cancellation rules',
        isDefault: true
      });
    }
    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/cancellation-policy
const updateCancellationPolicy = async (req, res, next) => {
  try {
    let policy = await CancellationPolicy.findOne({ isDefault: true });
    if (policy) {
      policy.rules = req.body.rules || policy.rules;
      await policy.save();
    } else {
      policy = await CancellationPolicy.create({
        name: 'Standard Railway/Bus Policy',
        isDefault: true,
        rules: req.body.rules
      });
    }
    res.status(200).json({ success: true, message: 'Cancellation policy updated', data: policy });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  toggleUserStatus,
  getOperators,
  toggleOperatorStatus,
  getAllBookings,
  getAuditLogs,
  getCancellationPolicy,
  updateCancellationPolicy
};

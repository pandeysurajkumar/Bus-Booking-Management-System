const jwt = require('jsonwebtoken');
const { User, Operator } = require('../models');
const { ROLES } = require('../config/constants');
const { recordAuditLog } = require('../utils/auditLogger');

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_bus_booking_platform_2026_algions',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async ({ name, email, password, role = ROLES.CUSTOMER, phone = '' }, req = null) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  // If role is operator and no operator exists yet, link or auto-assign if applicable
  let operatorId = null;
  if (role === ROLES.OPERATOR) {
    const defaultOperator = await Operator.findOne({ isActive: true });
    if (defaultOperator) {
      operatorId = defaultOperator._id;
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    operatorId
  });

  const token = signToken(user._id);

  await recordAuditLog({
    userId: user._id,
    userEmail: user.email,
    role: user.role,
    action: 'USER_REGISTERED',
    resource: 'User',
    resourceId: user._id,
    details: { role: user.role },
    req
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

const login = async ({ email, password }, req = null) => {
  const user = await User.findOne({ email }).select('+password').populate('operatorId');
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const token = signToken(user._id);

  await recordAuditLog({
    userId: user._id,
    userEmail: user.email,
    role: user.role,
    action: 'USER_LOGIN',
    resource: 'User',
    resourceId: user._id,
    req
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).populate('operatorId');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateProfile = async (userId, data) => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true }).populate('operatorId');
  return user;
};

module.exports = {
  signToken,
  register,
  login,
  getProfile,
  updateProfile
};

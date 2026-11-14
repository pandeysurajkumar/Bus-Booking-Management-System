const { ROLES } = require('../config/constants');

/**
 * Middleware to restrict access based on user role(s).
 * @param  {...string} roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not authorized to access this resource`
      });
    }

    next();
  };
};

/**
 * Middleware ensuring an operator can only query or mutate resources belonging to their assigned operatorId.
 */
const checkOperatorScope = (req, res, next) => {
  if (req.user.role === ROLES.ADMIN) {
    // Admins have global access
    return next();
  }

  if (req.user.role === ROLES.OPERATOR) {
    if (!req.user.operatorId) {
      return res.status(403).json({
        success: false,
        message: 'No operator profile linked to this operator account'
      });
    }
    // Set query filter / body default
    req.operatorFilter = { operatorId: req.user.operatorId };
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Operator or Admin role required'
  });
};

module.exports = {
  authorize,
  checkOperatorScope
};

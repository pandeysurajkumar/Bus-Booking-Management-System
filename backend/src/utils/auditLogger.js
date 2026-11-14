const { AuditLog } = require('../models');

/**
 * Records an audit log in the database.
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.userEmail
 * @param {string} params.role
 * @param {string} params.action
 * @param {string} params.resource
 * @param {string} params.resourceId
 * @param {Object} [params.details]
 * @param {Object} [params.req]
 */
const recordAuditLog = async ({
  userId = null,
  userEmail = '',
  role = 'system',
  action,
  resource,
  resourceId = '',
  details = {},
  req = null
}) => {
  try {
    let ipAddress = '';
    let userAgent = '';
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
      userAgent = req.headers['user-agent'] || '';
      if (!userId && req.user) {
        userId = req.user._id || req.user.id;
        userEmail = req.user.email || userEmail;
        role = req.user.role || role;
      }
    }

    await AuditLog.create({
      userId,
      userEmail,
      role,
      action,
      resource,
      resourceId: String(resourceId),
      details,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('[AuditLog] Failed to record log:', error.message);
  }
};

module.exports = {
  recordAuditLog
};

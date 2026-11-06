
import ApiError from "../utils/ApiError.js";

import { ROLE_PERMISSIONS } from "../constants/permissions.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(401, "Authentication required")
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to access this resource")
      );
    }

    next();
  };
};

export const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(401, "Authentication required")
      );
    }

    const userPermissions =
      ROLE_PERMISSIONS[req.user.role] || [];

    const hasPermission = requiredPermissions.every(
      (permission) => userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return next(
        new ApiError(403, "Required permission is missing")
      );
    }

    next();
  };
};

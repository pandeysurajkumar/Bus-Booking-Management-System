
import express from "express";

import authenticate from "../../middlewares/auth.middleware.js";

import {
  authorizeRoles,
  authorizePermissions
} from "../../middlewares/authorize.middleware.js";

import { ROLES } from "../../constants/roles.js";

import { PERMISSIONS } from "../../constants/permissions.js";

import ApiResponse from "../../utils/ApiResponse.js";

const router = express.Router();

// Only administrators can access this endpoint.
router.get(
  "/dashboard",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  (req, res) => {
    res.status(200).json(
      new ApiResponse(
        200,
        "Admin dashboard access granted",
        { user: req.user }
      )
    );
  }
);

// Admin and operator can manage trips.
router.get(
  "/trip-management",
  authenticate,
  authorizePermissions(PERMISSIONS.TRIP_MANAGE),
  (req, res) => {
    res.status(200).json(
      new ApiResponse(
        200,
        "Trip management access granted",
        { user: req.user }
      )
    );
  }
);

export default router;

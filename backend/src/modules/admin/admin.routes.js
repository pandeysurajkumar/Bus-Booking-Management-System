
import express from "express";

import authenticate from "../../middlewares/auth.middleware.js";

import {
  authorizeRoles,
  authorizePermissions
} from "../../middlewares/authorize.middleware.js";

import { ROLES } from "../../constants/roles.js";
import { PERMISSIONS } from "../../constants/permissions.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

import {
  listUsersController,
  updateUserStatusController,
  listBookingsController
} from "./admin.controller.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/dashboard",
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

router.get(
  "/trip-management",
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

router.get(
  "/users",
  authorizeRoles(ROLES.ADMIN),
  asyncHandler(listUsersController)
);

router.patch(
  "/users/:id/status",
  authorizeRoles(ROLES.ADMIN),
  asyncHandler(updateUserStatusController)
);

router.get(
  "/bookings",
  authorizeRoles(ROLES.ADMIN),
  asyncHandler(listBookingsController)
);

export default router;

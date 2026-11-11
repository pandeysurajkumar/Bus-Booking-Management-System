import { Router } from "express";
import { auditAction } from "../audit/audit.middleware.js";
import {
  createTripController,
  getTripsController,
  getTripController,
  updateTripController,
  cancelTripController,
  updateTripStatusController,
} from "./trip.controller.js";

import  authenticate  from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";
import  validate  from "../../middlewares/validate.middleware.js";
import  asyncHandler  from "../../utils/asyncHandler.js";

import {
  createTripSchema,
  updateTripSchema,
} from "./trip.validation.js";

import {
  updateTripStatusSchema,
} from "./trip.lifecycle.validation.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(getTripsController));

router.get("/:id", asyncHandler(getTripController));

router.post(
  "/",
  authorizeRoles("admin", "operator"),
  validate(createTripSchema),
  auditAction({
    action: "TRIP_CREATED",
    entityType: "Trip",
    description: "Trip schedule created",
  }),
  asyncHandler(createTripController)
);

router.patch(
  "/:id",
  authorizeRoles("admin", "operator"),
  validate(updateTripSchema),
  auditAction({
    action: "TRIP_UPDATED",
    entityType: "Trip",
    description: "Trip schedule updated",
  }),
  asyncHandler(updateTripController)
);

router.patch(
  "/:id/cancel",
  authorizeRoles("admin", "operator"),
  auditAction({
    action: "TRIP_CANCELLED",
    entityType: "Trip",
    description: "Trip schedule cancelled",
  }),
  asyncHandler(cancelTripController)
);

router.patch(
  "/:id/status",
  authorizeRoles("admin", "operator"),
  validate(updateTripStatusSchema),
  auditAction({
    action: "TRIP_STATUS_UPDATED",
    entityType: "Trip",
    description: "Trip lifecycle status changed",
  }),
  asyncHandler(updateTripStatusController)
);

export default router;
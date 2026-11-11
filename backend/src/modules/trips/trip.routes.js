import { Router } from "express";

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
  asyncHandler(createTripController)
);

router.patch(
  "/:id",
  authorizeRoles("admin", "operator"),
  validate(updateTripSchema),
  asyncHandler(updateTripController)
);

router.patch(
  "/:id/cancel",
  authorizeRoles("admin", "operator"),
  asyncHandler(cancelTripController)
);

router.patch(
  "/:id/status",
  authorizeRoles("admin", "operator"),
  validate(updateTripStatusSchema),
  asyncHandler(updateTripStatusController)
);

export default router;
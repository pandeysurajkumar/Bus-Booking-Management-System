import { Router } from "express";

import {
  getTripSeatsController,
  holdSeatController,
  releaseSeatController,
} from "./seat.controller.js";

import  authenticate  from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";
import  validate  from "../../middlewares/validate.middleware.js";
import  asyncHandler  from "../../utils/asyncHandler.js";

import {
  seatParamsSchema,
  holdSeatSchema,
  releaseSeatSchema,
} from "./seat.validation.js";

const router = Router();

router.get(
  "/:tripId",
  validate(seatParamsSchema),
  asyncHandler(getTripSeatsController)
);

router.post(
  "/:tripId/hold",
  authenticate,
  authorizeRoles("passenger"),
  validate(holdSeatSchema),
  asyncHandler(holdSeatController)
);

router.post(
  "/:tripId/release",
  authenticate,
  authorizeRoles("passenger"),
  validate(releaseSeatSchema),
  asyncHandler(releaseSeatController)
);

export default router;
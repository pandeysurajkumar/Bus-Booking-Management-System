import { Router } from "express";
import { auditAction } from "../audit/audit.middleware.js";
import {
  createBookingController,
  getMyBookingsController,
  getBookingByPNRController,
} from "./booking.controller.js";

import authenticate from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";

import { createBookingSchema } from "./booking.validation.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("passenger"),
  validate(createBookingSchema),
  auditAction({
  action: "BOOKING_CREATED",
  entityType: "Booking",
  description: "Passenger confirmed a booking",
  }),
  asyncHandler(createBookingController)
);

router.get(
  "/my",
  authorizeRoles("passenger"),
  asyncHandler(getMyBookingsController)
);

router.get(
  "/pnr/:pnr",
  asyncHandler(getBookingByPNRController)
);

export default router;
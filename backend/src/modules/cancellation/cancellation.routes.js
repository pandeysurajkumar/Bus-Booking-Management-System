import { Router } from "express";
import { auditAction } from "../audit/audit.middleware.js";
import {
  cancelBookingController,
  getCancellationPolicyController,
  simulatePaymentController,
  updateCancellationPolicyController,
} from "./cancellation.controller.js";

import  authenticate  from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";
import  validate  from "../../middlewares/validate.middleware.js";

import {
  updateCancellationPolicySchema,
} from "./cancellation.validation.js";

const router = Router();

router.get(
  "/policy",
  getCancellationPolicyController
);
  router.put(
    "/policy",
    authenticate,
    authorizeRoles("admin"),
    validate(updateCancellationPolicySchema),
    auditAction({
      action: "CANCELLATION_POLICY_UPDATED",
      entityType: "CancellationPolicy",
      description: "Admin updated cancellation policy",
    }),
    updateCancellationPolicyController
  );

  router.post(
    "/:pnr/pay",
    authenticate,
    authorizeRoles("passenger"),
    auditAction({
      action: "PAYMENT_SIMULATED",
      entityType: "Booking",
      description: "Passenger completed simulated payment",
    }),
    simulatePaymentController
  );

  router.post(
    "/:pnr/cancel",
    authenticate,
    auditAction({
      action: "BOOKING_CANCELLED",
      entityType: "Booking",
      description: "Booking was cancelled",
    }),
    cancelBookingController
  );
export default router;
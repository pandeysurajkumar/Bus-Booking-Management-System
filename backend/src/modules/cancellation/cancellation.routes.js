import { Router } from "express";

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
  updateCancellationPolicyController
);

router.post(
  "/:pnr/pay",
  authenticate,
  authorizeRoles("passenger"),
  simulatePaymentController
);

router.post(
  "/:pnr/cancel",
  authenticate,
  cancelBookingController
);

export default router;
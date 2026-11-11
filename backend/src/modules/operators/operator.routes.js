import { Router } from "express";

import {
  createOperatorController,
  getOperatorsController,
  updateOperatorStatusController,
} from "./operator.controller.js";

import  authenticate  from "../../middlewares/auth.middleware.js";
import  validate  from "../../middlewares/validate.middleware.js";
import {
  createOperatorSchema,
  updateOperatorStatusSchema,
} from "./operator.validation.js";
import  asyncHandler  from "../../utils/asyncHandler.js";

import { authorizeRoles } from "../../middlewares/authorize.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("admin"));

router.post(
  "/",
  validate(createOperatorSchema),
  asyncHandler(createOperatorController)
);

router.get(
  "/",
  asyncHandler(getOperatorsController)
);

router.patch(
  "/:id/status",
  validate(updateOperatorStatusSchema),
  asyncHandler(updateOperatorStatusController)
);

export default router;
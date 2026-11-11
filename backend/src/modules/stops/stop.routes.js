
import { Router } from "express";

import {
  createStopController,
  getStopsController,
  getStopController,
} from "./stop.controller.js";

import  authenticate  from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";
import  validate  from "../../middlewares/validate.middleware.js";
import  asyncHandler  from "../../utils/asyncHandler.js";

import { createStopSchema } from "./stop.validation.js";

const router = Router();

router.get("/", asyncHandler(getStopsController));
router.get("/:id", asyncHandler(getStopController));

router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validate(createStopSchema),
  asyncHandler(createStopController)
);

export default router;
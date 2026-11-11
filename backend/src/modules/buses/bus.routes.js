import { Router } from "express";
import { auditAction } from "../audit/audit.middleware.js";
import {
  createBusController,
  getBusesController,
  getBusController,
  updateBusController,
  archiveBusController,
} from "./bus.controller.js";

import  authenticate  from "../../middlewares/auth.middleware.js";
import  validate  from "../../middlewares/validate.middleware.js";

import {
  createBusSchema,
  updateBusSchema,
} from "./bus.validation.js";

import  asyncHandler  from "../../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(createBusSchema),
  auditAction({
    action: "BUS_CREATED",
    entityType: "Bus",
    description: "New bus registered",
  }),
  asyncHandler(createBusController)
);

router.get(
  "/",
  asyncHandler(getBusesController)
);

router.get(
  "/:id",
  asyncHandler(getBusController)
);

router.patch(
  "/:id",
  validate(updateBusSchema),
  auditAction({
    action: "BUS_UPDATED",
    entityType: "Bus",
    description: "Bus details updated",
  }),
  asyncHandler(updateBusController)
);

router.delete(
  "/:id",
  auditAction({
    action: "BUS_ARCHIVED",
    entityType: "Bus",
    description: "Bus archived",
  }),
  asyncHandler(archiveBusController)
);

export default router;
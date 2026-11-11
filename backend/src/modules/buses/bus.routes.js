import { Router } from "express";

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
  asyncHandler(updateBusController)
);

router.delete(
  "/:id",
  asyncHandler(archiveBusController)
);

export default router;
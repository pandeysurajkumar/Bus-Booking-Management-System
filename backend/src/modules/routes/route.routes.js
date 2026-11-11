import { Router } from "express";

import {
  createRouteController,
  getRoutesController,
  getRouteController,
} from "./route.controller.js";

import  authenticate  from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";
import  validate  from "../../middlewares/validate.middleware.js";
import  asyncHandler  from "../../utils/asyncHandler.js";

import { createRouteSchema } from "./route.validation.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(getRoutesController));

router.get("/:id", asyncHandler(getRouteController));

router.post(
  "/",
  authorizeRoles("admin", "operator"),
  validate(createRouteSchema),
  asyncHandler(createRouteController)
);

export default router
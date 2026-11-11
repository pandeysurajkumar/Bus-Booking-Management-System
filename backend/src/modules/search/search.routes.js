import { Router } from "express";

import { searchTripsController } from "./search.controller.js";

import  validate  from "../../middlewares/validate.middleware.js";
import  asyncHandler  from "../../utils/asyncHandler.js";

import { searchTripsSchema } from "./search.validation.js";

const router = Router();

router.get(
  "/trips",
  validate(searchTripsSchema),
  asyncHandler(searchTripsController)
);

export default router;
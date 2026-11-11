import { Router } from "express";

import {
  getDashboardSummaryController,
  getPassengerManifestController,
  getTripReportsController,
} from "./report.controller.js";

import  authenticate  from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("admin", "operator"));

router.get("/dashboard", getDashboardSummaryController);

router.get("/trips", getTripReportsController);

router.get(
  "/trips/:tripId/manifest",
  getPassengerManifestController
);

export default router;
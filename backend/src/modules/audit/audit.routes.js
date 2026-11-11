import { Router } from "express";

import  authenticate  from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";

import { getAuditLogsController } from "./audit.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("admin", "operator"));

router.get("/", getAuditLogsController);

export default router;
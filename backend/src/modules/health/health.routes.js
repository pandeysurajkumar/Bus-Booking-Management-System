
import express from "express";
import { healthCheck } from "./health.controller.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Check server and database health
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server and database are healthy
 *       503:
 *         description: Database is unavailable
 */
router.get("/", healthCheck);

export default router;

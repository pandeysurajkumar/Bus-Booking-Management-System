
import express from "express";

import {
  register,
  login,
  refresh,
  logout,
  getMe
} from "./auth.controller.js";

import {
  registerSchema,
  loginSchema
} from "./auth.validation.js";

import validateBody from "../../middlewares/validate.middleware.js";
import authenticate from "../../middlewares/auth.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a passenger
 *     tags: [Authentication]
 *     responses:
 *       201:
 *         description: Passenger registered
 *       409:
 *         description: Email already registered
 */
router.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(register)
);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(login)
);

router.post(
  "/refresh",
  asyncHandler(refresh)
);

router.post(
  "/logout",
  asyncHandler(logout)
);

router.get(
  "/me",
  authenticate,
  asyncHandler(getMe)
);

export default router;

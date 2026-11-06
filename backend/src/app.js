
import "dotenv/config";

import adminRoutes from "./modules/admin/admin.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import healthRoutes from "./modules/health/health.routes.js";

import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// 1. Security headers
app.use(helmet());

// 2. Cross-origin configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);

// 3. Parse incoming JSON
app.use(express.json({ limit: "10kb" }));

// 4. Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// 5. Parse cookies
app.use(cookieParser());

// 6. Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use("/api", apiLimiter);

// 7. API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 8. API routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);

// 9. Handle unknown routes
app.use(notFoundMiddleware);

// 10. Centralized error handling
app.use(errorMiddleware);

export default app;

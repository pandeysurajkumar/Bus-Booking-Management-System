
import "dotenv/config";

import cancellationRoutes from "./modules/cancellation/cancellation.routes.js";
import bookingRoutes from "./modules/bookings/booking.routes.js";
import seatRoutes from "./modules/seats/seat.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import tripRoutes from "./modules/trips/trip.routes.js";
import routeRoutes from "./modules/routes/route.routes.js";
import stopRoutes from "./modules/stops/stop.routes.js";
import operatorRoutes from "./modules/operators/operator.routes.js";
import busRoutes from "./modules/buses/bus.routes.js";
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
app.use("/api/v1/buses", busRoutes);
app.use("/api/v1/operators", operatorRoutes);
app.use("/api/v1/stops", stopRoutes);
app.use("/api/v1/routes", routeRoutes);
app.use("/api/v1/trips", tripRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/seats", seatRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/cancellations", cancellationRoutes);

// 9. Handle unknown routes
app.use(notFoundMiddleware);

// 10. Centralized error handling
app.use(errorMiddleware);

export default app;

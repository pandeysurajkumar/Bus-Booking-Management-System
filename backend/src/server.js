
import "dotenv/config";

import http from "node:http";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB before accepting requests
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}/api/v1/health`);
      console.log(`Swagger: http://localhost:${PORT}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        await mongoose.disconnect();
        console.log("Server and database disconnected.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

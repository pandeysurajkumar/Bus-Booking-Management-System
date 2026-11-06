
import mongoose from "mongoose";
import ApiResponse from "../../utils/ApiResponse.js";

export const healthCheck = (req, res) => {
  const databaseConnected =
    mongoose.connection.readyState === 1;

  const status = databaseConnected ? "healthy" : "unhealthy";

  const response = new ApiResponse(
    databaseConnected ? 200 : 503,
    databaseConnected
      ? "Server is running successfully"
      : "Database connection unavailable",
    {
      status,
      database: databaseConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    }
  );

  res.status(response.statusCode).json(response);
};

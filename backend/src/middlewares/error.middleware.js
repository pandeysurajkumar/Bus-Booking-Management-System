
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate record already exists";
  }

  const response = {
    success: false,
    statusCode,
    message,
    errors: err.errors || []
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorMiddleware;

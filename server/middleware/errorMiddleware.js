const env = require("../config/env");

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function notFoundMiddleware(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorMiddleware(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error.";
  let details = error.details;

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed.";
    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "A record with these values already exists.";
    details = { fields: Object.keys(error.keyPattern || {}) };
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "One or more identifiers are invalid.";
  }

  const response = {
    success: false,
    message: statusCode >= 500 && env.nodeEnv === "production"
      ? "Internal server error."
      : message,
  };

  if (details) {
    response.details = details;
  }

  if (env.nodeEnv !== "test" && statusCode >= 500) {
    console.error("Unhandled request error:", {
      method: req.method,
      path: req.originalUrl,
      message: error.message,
      stack: error.stack,
    });
  }

  res.status(statusCode).json(response);
}

module.exports = {
  asyncHandler,
  notFoundMiddleware,
  errorMiddleware,
};
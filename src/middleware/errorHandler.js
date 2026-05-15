// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Log error for debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
  });

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    statusCode = 400;
    message = `Duplicate value for ${field}. This ${field} already exists.`;
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose Cast Error (Invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your token has expired. Please log in again.";
  }

  // Rate Limit Error
  if (err.status === 429) {
    statusCode = 429;
    message = "Too many requests. Please try again later.";
  }

  // Send Response
  res.status(statusCode).json({
    status: "error",
    message,
    requestId: req.requestId,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err.toString(),
    }),
  });
};

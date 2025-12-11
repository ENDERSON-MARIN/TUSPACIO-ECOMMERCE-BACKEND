const logger = require("../utils/logger");

/**
 * Custom error classes for better error handling
 */
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND_ERROR");
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409, "CONFLICT_ERROR");
  }
}

class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429, "RATE_LIMIT_ERROR");
  }
}

class DatabaseError extends AppError {
  constructor(message = "Database operation failed", details = null) {
    super(message, 500, "DATABASE_ERROR", details);
  }
}

class ExternalServiceError extends AppError {
  constructor(message = "External service error", details = null) {
    super(message, 502, "EXTERNAL_SERVICE_ERROR", details);
  }
}

/**
 * Error handling utilities
 */
class ErrorHandler {
  /**
   * Handle Sequelize database errors
   * @param {Error} error - Sequelize error
   * @returns {AppError} Formatted application error
   */
  static handleSequelizeError(error) {
    let message = "Database operation failed";
    let statusCode = 500;
    let code = "DATABASE_ERROR";
    let details = null;

    switch (error.name) {
      case "SequelizeValidationError":
        message = "Validation failed";
        statusCode = 400;
        code = "VALIDATION_ERROR";
        details = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
          value: err.value,
        }));
        break;

      case "SequelizeUniqueConstraintError":
        message = "Resource already exists";
        statusCode = 409;
        code = "CONFLICT_ERROR";
        details = error.errors.map((err) => ({
          field: err.path,
          message: `${err.path} must be unique`,
          value: err.value,
        }));
        break;

      case "SequelizeForeignKeyConstraintError":
        message = "Invalid reference to related resource";
        statusCode = 400;
        code = "FOREIGN_KEY_ERROR";
        details = {
          table: error.table,
          field: error.fields,
        };
        break;

      case "SequelizeConnectionError":
      case "SequelizeConnectionRefusedError":
      case "SequelizeHostNotFoundError":
      case "SequelizeHostNotReachableError":
        message = "Database connection failed";
        statusCode = 503;
        code = "DATABASE_CONNECTION_ERROR";
        break;

      case "SequelizeTimeoutError":
        message = "Database operation timed out";
        statusCode = 504;
        code = "DATABASE_TIMEOUT_ERROR";
        break;

      default:
        message = error.message || "Database operation failed";
        break;
    }

    return new AppError(message, statusCode, code, details);
  }

  /**
   * Handle JWT errors
   * @param {Error} error - JWT error
   * @returns {AppError} Formatted application error
   */
  static handleJWTError(error) {
    let message = "Authentication failed";
    let code = "AUTHENTICATION_ERROR";

    switch (error.name) {
      case "TokenExpiredError":
        message = "Access token has expired";
        code = "TOKEN_EXPIRED";
        break;
      case "JsonWebTokenError":
        message = "Invalid access token";
        code = "INVALID_TOKEN";
        break;
      case "NotBeforeError":
        message = "Token not active yet";
        code = "TOKEN_NOT_ACTIVE";
        break;
      default:
        message = "Token verification failed";
        code = "TOKEN_VERIFICATION_FAILED";
        break;
    }

    return new AppError(message, 401, code);
  }

  /**
   * Handle Stripe payment errors
   * @param {Error} error - Stripe error
   * @returns {AppError} Formatted application error
   */
  static handleStripeError(error) {
    let message = "Payment processing failed";
    let statusCode = 400;
    let code = "PAYMENT_ERROR";

    switch (error.type) {
      case "StripeCardError":
        message = error.message;
        code = "CARD_ERROR";
        break;
      case "StripeRateLimitError":
        message = "Too many requests to payment processor";
        statusCode = 429;
        code = "PAYMENT_RATE_LIMIT";
        break;
      case "StripeInvalidRequestError":
        message = "Invalid payment request";
        code = "INVALID_PAYMENT_REQUEST";
        break;
      case "StripeAPIError":
        message = "Payment service temporarily unavailable";
        statusCode = 502;
        code = "PAYMENT_SERVICE_ERROR";
        break;
      case "StripeConnectionError":
        message = "Payment service connection failed";
        statusCode = 503;
        code = "PAYMENT_CONNECTION_ERROR";
        break;
      case "StripeAuthenticationError":
        message = "Payment authentication failed";
        statusCode = 401;
        code = "PAYMENT_AUTH_ERROR";
        break;
      default:
        message = error.message || "Payment processing failed";
        break;
    }

    return new AppError(message, statusCode, code);
  }

  /**
   * Handle validation errors from express-joi-validation
   * @param {Error} error - Validation error
   * @returns {AppError} Formatted application error
   */
  static handleJoiValidationError(error) {
    const details = error.error?.details?.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
      value: detail.context?.value,
    }));

    return new ValidationError("Request validation failed", details);
  }

  /**
   * Send error response in development
   * @param {AppError} err - Application error
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static sendErrorDev(err, req, res) {
    // Log error for debugging
    logger.error("Error in development:", {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(err.statusCode).json({
      status: err.status,
      error: err.message,
      code: err.code,
      details: err.details,
      stack: err.stack,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
    });
  }

  /**
   * Send error response in production
   * @param {AppError} err - Application error
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static sendErrorProd(err, req, res) {
    // Log error for monitoring
    logger.error("Production error:", {
      error: err.message,
      code: err.code,
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: req.user?.userId,
    });

    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        code: err.code,
        ...(err.details && { details: err.details }),
        timestamp: new Date().toISOString(),
      });
    } else {
      // Programming or other unknown error: don't leak error details
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
        code: "INTERNAL_SERVER_ERROR",
        timestamp: new Date().toISOString(),
      });
    }
  }
}

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Create a copy of the error
  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (
    err.name === "SequelizeValidationError" ||
    err.name?.startsWith("Sequelize")
  ) {
    error = ErrorHandler.handleSequelizeError(err);
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    error = ErrorHandler.handleJWTError(err);
  } else if (err.type?.startsWith("Stripe")) {
    error = ErrorHandler.handleStripeError(err);
  } else if (err.error?.isJoi || err.name === "ValidationError") {
    error = ErrorHandler.handleJoiValidationError(err);
  } else if (err.code === "LIMIT_FILE_SIZE") {
    error = new AppError(
      "File size exceeds the allowed limit",
      413,
      "FILE_TOO_LARGE"
    );
  } else if (err.message?.includes("CORS")) {
    error = new AppError("Cross-origin request blocked", 403, "CORS_ERROR");
  } else if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
    error = new ExternalServiceError("External service unavailable");
  }

  // Send error response based on environment
  if (process.env.NODE_ENV === "development") {
    ErrorHandler.sendErrorDev(error, req, res);
  } else {
    ErrorHandler.sendErrorProd(error, req, res);
  }
};

/**
 * Catch async errors middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle unhandled routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleNotFound = (req, res, next) => {
  const error = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`);
  next(error);
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  ErrorHandler,
  globalErrorHandler,
  catchAsync,
  handleNotFound,
};

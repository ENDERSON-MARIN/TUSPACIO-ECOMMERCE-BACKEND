const Joi = require("joi");

/**
 * Enhanced validation middleware factory
 * Creates validation middleware for different parts of the request
 */
class ValidationMiddleware {
  /**
   * Create validation middleware for request body
   * @param {Joi.Schema} schema - Joi validation schema
   * @param {Object} options - Validation options
   * @returns {Function} Express middleware function
   */
  static validateBody(schema, options = {}) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: options.allowUnknown || false,
        stripUnknown: options.stripUnknown || true,
        ...options,
      });

      if (error) {
        const validationError = new Error("Validation Error");
        validationError.name = "ValidationError";
        validationError.status = 400;
        validationError.details = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        }));
        return next(validationError);
      }

      // Replace req.body with validated and sanitized data
      req.body = value;
      next();
    };
  }

  /**
   * Create validation middleware for request parameters
   * @param {Joi.Schema} schema - Joi validation schema
   * @param {Object} options - Validation options
   * @returns {Function} Express middleware function
   */
  static validateParams(schema, options = {}) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        allowUnknown: options.allowUnknown || false,
        stripUnknown: options.stripUnknown || true,
        ...options,
      });

      if (error) {
        const validationError = new Error("Parameter Validation Error");
        validationError.name = "ValidationError";
        validationError.status = 400;
        validationError.details = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        }));
        return next(validationError);
      }

      req.params = value;
      next();
    };
  }

  /**
   * Create validation middleware for query parameters
   * @param {Joi.Schema} schema - Joi validation schema
   * @param {Object} options - Validation options
   * @returns {Function} Express middleware function
   */
  static validateQuery(schema, options = {}) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        allowUnknown: options.allowUnknown || true,
        stripUnknown: options.stripUnknown || false,
        ...options,
      });

      if (error) {
        const validationError = new Error("Query Validation Error");
        validationError.name = "ValidationError";
        validationError.status = 400;
        validationError.details = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        }));
        return next(validationError);
      }

      req.query = value;
      next();
    };
  }

  /**
   * Create validation middleware for request headers
   * @param {Joi.Schema} schema - Joi validation schema
   * @param {Object} options - Validation options
   * @returns {Function} Express middleware function
   */
  static validateHeaders(schema, options = {}) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.headers, {
        abortEarly: false,
        allowUnknown: options.allowUnknown || true,
        stripUnknown: options.stripUnknown || false,
        ...options,
      });

      if (error) {
        const validationError = new Error("Header Validation Error");
        validationError.name = "ValidationError";
        validationError.status = 400;
        validationError.details = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        }));
        return next(validationError);
      }

      // Don't replace headers, just validate them
      next();
    };
  }

  /**
   * Comprehensive validation middleware that validates multiple parts of the request
   * @param {Object} schemas - Object containing schemas for different parts
   * @param {Object} options - Validation options
   * @returns {Function} Express middleware function
   */
  static validate(schemas = {}, options = {}) {
    return (req, res, next) => {
      const errors = [];

      // Validate body
      if (schemas.body) {
        const { error } = schemas.body.validate(req.body, {
          abortEarly: false,
          allowUnknown: options.allowUnknown || false,
          stripUnknown: options.stripUnknown || true,
        });
        if (error) {
          errors.push(
            ...error.details.map((detail) => ({
              location: "body",
              field: detail.path.join("."),
              message: detail.message,
              value: detail.context?.value,
            }))
          );
        }
      }

      // Validate params
      if (schemas.params) {
        const { error } = schemas.params.validate(req.params, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true,
        });
        if (error) {
          errors.push(
            ...error.details.map((detail) => ({
              location: "params",
              field: detail.path.join("."),
              message: detail.message,
              value: detail.context?.value,
            }))
          );
        }
      }

      // Validate query
      if (schemas.query) {
        const { error } = schemas.query.validate(req.query, {
          abortEarly: false,
          allowUnknown: true,
          stripUnknown: false,
        });
        if (error) {
          errors.push(
            ...error.details.map((detail) => ({
              location: "query",
              field: detail.path.join("."),
              message: detail.message,
              value: detail.context?.value,
            }))
          );
        }
      }

      // Validate headers
      if (schemas.headers) {
        const { error } = schemas.headers.validate(req.headers, {
          abortEarly: false,
          allowUnknown: true,
          stripUnknown: false,
        });
        if (error) {
          errors.push(
            ...error.details.map((detail) => ({
              location: "headers",
              field: detail.path.join("."),
              message: detail.message,
              value: detail.context?.value,
            }))
          );
        }
      }

      if (errors.length > 0) {
        const validationError = new Error("Request Validation Error");
        validationError.name = "ValidationError";
        validationError.status = 400;
        validationError.details = errors;
        return next(validationError);
      }

      next();
    };
  }
}

/**
 * Common validation schemas for reuse across the application
 */
const CommonSchemas = {
  // ID parameter validation
  id: Joi.string()
    .pattern(/^[a-zA-Z0-9-_]+$/)
    .min(1)
    .max(50)
    .required()
    .messages({
      "string.pattern.base":
        "ID must contain only alphanumeric characters, hyphens, and underscores",
      "string.min": "ID must be at least 1 character long",
      "string.max": "ID must not exceed 50 characters",
    }),

  // UUID validation
  uuid: Joi.string()
    .uuid({ version: ["uuidv4"] })
    .required()
    .messages({
      "string.guid": "Must be a valid UUID v4",
    }),

  // Email validation
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .required()
    .messages({
      "string.email": "Must be a valid email address",
      "string.max": "Email must not exceed 255 characters",
    }),

  // Password validation
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must not exceed 128 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),

  // Name validation
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z\s\u00C0-\u017F]+$/)
    .required()
    .messages({
      "string.min": "Name must be at least 1 character long",
      "string.max": "Name must not exceed 100 characters",
      "string.pattern.base": "Name must contain only letters and spaces",
    }),

  // Phone number validation
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      "string.pattern.base": "Must be a valid phone number",
    }),

  // Pagination parameters
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid("asc", "desc").default("asc"),
    sortBy: Joi.string().max(50),
  },

  // Date validation
  date: Joi.date().iso().messages({
    "date.format": "Date must be in ISO format (YYYY-MM-DD)",
  }),

  // URL validation
  url: Joi.string().uri().messages({
    "string.uri": "Must be a valid URL",
  }),
};

module.exports = {
  ValidationMiddleware,
  CommonSchemas,
};

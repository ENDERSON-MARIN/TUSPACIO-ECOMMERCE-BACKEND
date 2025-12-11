const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

/**
 * Enhanced logging utility for the application
 */
class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), "logs");
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Get current timestamp in ISO format
   * @returns {string} ISO timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @returns {string} Formatted log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta,
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Write log to file
   * @param {string} filename - Log filename
   * @param {string} message - Log message
   */
  writeToFile(filename, message) {
    const logPath = path.join(this.logDir, filename);
    const logLine = `${message}\n`;

    fs.appendFile(logPath, logLine, (err) => {
      if (err) {
        console.error("Failed to write to log file:", err);
      }
    });
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    const formattedMessage = this.formatMessage("info", message, meta);
    console.log(formattedMessage);

    if (process.env.NODE_ENV === "production") {
      this.writeToFile("app.log", formattedMessage);
    }
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage("warn", message, meta);
    console.warn(formattedMessage);

    if (process.env.NODE_ENV === "production") {
      this.writeToFile("app.log", formattedMessage);
    }
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  error(message, meta = {}) {
    const formattedMessage = this.formatMessage("error", message, meta);
    console.error(formattedMessage);

    // Always write errors to file
    this.writeToFile("error.log", formattedMessage);
    if (process.env.NODE_ENV === "production") {
      this.writeToFile("app.log", formattedMessage);
    }
  }

  /**
   * Log debug message (only in development)
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    if (process.env.NODE_ENV !== "production") {
      const formattedMessage = this.formatMessage("debug", message, meta);
      console.debug(formattedMessage);
    }
  }

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in milliseconds
   */
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: req.user?.userId,
      contentLength: res.get("Content-Length"),
    };

    this.info("HTTP Request", logData);
  }

  /**
   * Log database operation
   * @param {string} operation - Database operation type
   * @param {string} model - Model name
   * @param {Object} meta - Additional metadata
   */
  logDatabase(operation, model, meta = {}) {
    this.debug(`Database ${operation}`, {
      model,
      ...meta,
    });
  }

  /**
   * Log authentication event
   * @param {string} event - Authentication event type
   * @param {Object} meta - Additional metadata
   */
  logAuth(event, meta = {}) {
    this.info(`Authentication: ${event}`, meta);
  }

  /**
   * Log security event
   * @param {string} event - Security event type
   * @param {Object} meta - Additional metadata
   */
  logSecurity(event, meta = {}) {
    this.warn(`Security: ${event}`, meta);
    this.writeToFile(
      "security.log",
      this.formatMessage("security", event, meta)
    );
  }

  /**
   * Log payment event
   * @param {string} event - Payment event type
   * @param {Object} meta - Additional metadata
   */
  logPayment(event, meta = {}) {
    // Remove sensitive payment data
    const sanitizedMeta = { ...meta };
    delete sanitizedMeta.cardNumber;
    delete sanitizedMeta.cvv;
    delete sanitizedMeta.paymentMethodId;

    this.info(`Payment: ${event}`, sanitizedMeta);
    this.writeToFile(
      "payment.log",
      this.formatMessage("payment", event, sanitizedMeta)
    );
  }

  /**
   * Log email event
   * @param {string} event - Email event type
   * @param {Object} meta - Additional metadata
   */
  logEmail(event, meta = {}) {
    this.info(`Email: ${event}`, meta);
  }

  /**
   * Create Morgan middleware for HTTP request logging
   * @returns {Function} Morgan middleware
   */
  createMorganMiddleware() {
    // Custom Morgan format
    const format = process.env.NODE_ENV === "production" ? "combined" : "dev";

    // Custom tokens
    morgan.token("id", (req) => req.user?.userId || "anonymous");
    morgan.token("real-ip", (req) => req.ip);

    const customFormat =
      ':real-ip - :id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

    return morgan(customFormat, {
      stream: {
        write: (message) => {
          // Remove newline and parse the message
          const cleanMessage = message.trim();
          this.info("HTTP Request", { raw: cleanMessage });
        },
      },
      skip: (req, res) => {
        // Skip logging for health checks in production
        return (
          process.env.NODE_ENV === "production" &&
          (req.url === "/health" || req.url === "/api/health")
        );
      },
    });
  }

  /**
   * Create request timing middleware
   * @returns {Function} Express middleware
   */
  createTimingMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();

      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = function (...args) {
        const responseTime = Date.now() - startTime;
        req.responseTime = responseTime;

        // Log slow requests
        if (responseTime > 1000) {
          logger.warn("Slow request detected", {
            method: req.method,
            url: req.originalUrl,
            responseTime: `${responseTime}ms`,
            userId: req.user?.userId,
          });
        }

        originalEnd.apply(this, args);
      };

      next();
    };
  }

  /**
   * Create monitoring middleware for system metrics
   * @returns {Function} Express middleware
   */
  createMonitoringMiddleware() {
    return (req, res, next) => {
      // Log system metrics periodically
      if (Math.random() < 0.01) {
        // 1% of requests
        const memUsage = process.memoryUsage();
        this.info("System Metrics", {
          memory: {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
          },
          uptime: `${Math.round(process.uptime())}s`,
          pid: process.pid,
        });
      }

      next();
    };
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;

const { database } = require('../db');
const logger = require('./logger');

/**
 * Performance monitoring utility for tracking system metrics and health
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        responseTimes: [],
      },
      database: {
        connections: {
          active: 0,
          idle: 0,
          total: 0,
        },
        queries: {
          total: 0,
          successful: 0,
          failed: 0,
          averageTime: 0,
        },
      },
      system: {
        memory: {
          rss: 0,
          heapTotal: 0,
          heapUsed: 0,
          external: 0,
        },
        cpu: {
          usage: 0,
        },
        uptime: 0,
      },
      errors: {
        total: 0,
        byType: {},
        recent: [],
      },
    };

    this.startTime = Date.now();
    this.lastMetricsUpdate = Date.now();

    // Start periodic metrics collection
    this.startPeriodicCollection();
  }

  /**
   * Start periodic metrics collection
   */
  startPeriodicCollection() {
    // Update system metrics every 30 seconds
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000);

    // Clean old response times every 5 minutes
    setInterval(() => {
      this.cleanOldMetrics();
    }, 300000);
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    this.metrics.system.memory = {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
    };

    this.metrics.system.uptime = Math.round(process.uptime());
    this.lastMetricsUpdate = Date.now();

    // Update database connection metrics if available
    this.updateDatabaseMetrics();

    // Log system metrics periodically
    if (Math.random() < 0.1) {
      // 10% chance to log
      logger.info('System Performance Metrics', {
        memory: this.metrics.system.memory,
        uptime: this.metrics.system.uptime,
        requests: {
          total: this.metrics.requests.total,
          avgResponseTime: this.metrics.requests.averageResponseTime,
        },
        database: this.metrics.database.connections,
      });
    }
  }

  /**
   * Update database connection metrics
   */
  updateDatabaseMetrics() {
    try {
      if (
        database &&
        database.connectionManager &&
        database.connectionManager.pool
      ) {
        const pool = database.connectionManager.pool;
        this.metrics.database.connections = {
          active: pool.size || 0,
          idle: pool.available || 0,
          total: (pool.size || 0) + (pool.available || 0),
          max: pool.options?.max || 0,
        };
      }
    } catch (error) {
      // Silently handle database metrics errors
      logger.debug('Failed to update database metrics', {
        error: error.message,
      });
    }
  }

  /**
   * Record HTTP request metrics
   * @param {number} responseTime - Response time in milliseconds
   * @param {number} statusCode - HTTP status code
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   */
  recordRequest(responseTime, statusCode, method, url) {
    this.metrics.requests.total++;

    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Record response time
    this.metrics.requests.responseTimes.push({
      time: responseTime,
      timestamp: Date.now(),
      statusCode,
      method,
      url,
    });

    // Update average response time
    this.updateAverageResponseTime();

    // Log slow requests
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        responseTime: `${responseTime}ms`,
        method,
        url,
        statusCode,
      });
    }
  }

  /**
   * Record database query metrics
   * @param {number} queryTime - Query execution time in milliseconds
   * @param {boolean} success - Whether the query was successful
   * @param {string} operation - Type of database operation
   */
  recordDatabaseQuery(queryTime, success, operation = 'unknown') {
    this.metrics.database.queries.total++;

    if (success) {
      this.metrics.database.queries.successful++;
    } else {
      this.metrics.database.queries.failed++;
    }

    // Update average query time
    const currentAvg = this.metrics.database.queries.averageTime;
    const total = this.metrics.database.queries.total;
    this.metrics.database.queries.averageTime =
      (currentAvg * (total - 1) + queryTime) / total;

    // Log slow queries
    if (queryTime > 500) {
      logger.warn('Slow database query detected', {
        queryTime: `${queryTime}ms`,
        operation,
        success,
      });
    }
  }

  /**
   * Record error occurrence
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  recordError(error, context = 'unknown') {
    this.metrics.errors.total++;

    const errorType = error.name || 'UnknownError';
    if (!this.metrics.errors.byType[errorType]) {
      this.metrics.errors.byType[errorType] = 0;
    }
    this.metrics.errors.byType[errorType]++;

    // Keep recent errors (last 100)
    this.metrics.errors.recent.push({
      message: error.message,
      type: errorType,
      context,
      timestamp: Date.now(),
      stack: error.stack,
    });

    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent = this.metrics.errors.recent.slice(-100);
    }

    logger.error('Error recorded in performance monitor', {
      error: error.message,
      type: errorType,
      context,
    });
  }

  /**
   * Update average response time
   */
  updateAverageResponseTime() {
    const responseTimes = this.metrics.requests.responseTimes;
    if (responseTimes.length === 0) {return;}

    const sum = responseTimes.reduce((acc, rt) => acc + rt.time, 0);
    this.metrics.requests.averageResponseTime = Math.round(
      sum / responseTimes.length
    );
  }

  /**
   * Clean old metrics to prevent memory leaks
   */
  cleanOldMetrics() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    // Keep only response times from the last 5 minutes
    this.metrics.requests.responseTimes =
      this.metrics.requests.responseTimes.filter(
        rt => rt.timestamp > fiveMinutesAgo
      );

    // Recalculate average response time
    this.updateAverageResponseTime();

    // Keep only recent errors from the last hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.metrics.errors.recent = this.metrics.errors.recent.filter(
      error => error.timestamp > oneHourAgo
    );
  }

  /**
   * Get comprehensive health status
   * @returns {Object} Health status object
   */
  async getHealthStatus() {
    // Update metrics before returning
    this.updateSystemMetrics();

    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      metrics: {
        system: this.metrics.system,
        requests: {
          total: this.metrics.requests.total,
          successful: this.metrics.requests.successful,
          failed: this.metrics.requests.failed,
          successRate:
            this.metrics.requests.total > 0
              ? Math.round(
                  (this.metrics.requests.successful /
                    this.metrics.requests.total) *
                    100
                )
              : 100,
          averageResponseTime: this.metrics.requests.averageResponseTime,
        },
        database: {
          connections: this.metrics.database.connections,
          queries: this.metrics.database.queries,
        },
        errors: {
          total: this.metrics.errors.total,
          byType: this.metrics.errors.byType,
          recentCount: this.metrics.errors.recent.length,
        },
      },
    };

    // Check database connectivity
    try {
      await database.authenticate();
      health.database = {
        status: 'connected',
        type: 'PostgreSQL',
        version: await this.getDatabaseVersion(),
      };
    } catch (error) {
      health.database = {
        status: 'disconnected',
        error: error.message,
      };
      health.status = 'DEGRADED';
    }

    // Determine overall health status
    const memoryUsagePercent =
      (this.metrics.system.memory.heapUsed /
        this.metrics.system.memory.heapTotal) *
      100;
    const errorRate =
      this.metrics.requests.total > 0
        ? (this.metrics.requests.failed / this.metrics.requests.total) * 100
        : 0;

    if (
      memoryUsagePercent > 90 ||
      errorRate > 10 ||
      health.database.status === 'disconnected'
    ) {
      health.status = 'UNHEALTHY';
    } else if (memoryUsagePercent > 75 || errorRate > 5) {
      health.status = 'DEGRADED';
    }

    return health;
  }

  /**
   * Get database version
   * @returns {string} Database version
   */
  async getDatabaseVersion() {
    try {
      const result = await database.query('SELECT version()');
      return result[0][0].version.split(' ')[1] || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get performance metrics summary
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    this.updateSystemMetrics();
    return {
      ...this.metrics,
      lastUpdate: new Date(this.lastMetricsUpdate).toISOString(),
      monitoringDuration: Math.round((Date.now() - this.startTime) / 1000),
    };
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        responseTimes: [],
      },
      database: {
        connections: {
          active: 0,
          idle: 0,
          total: 0,
        },
        queries: {
          total: 0,
          successful: 0,
          failed: 0,
          averageTime: 0,
        },
      },
      system: {
        memory: {
          rss: 0,
          heapTotal: 0,
          heapUsed: 0,
          external: 0,
        },
        cpu: {
          usage: 0,
        },
        uptime: 0,
      },
      errors: {
        total: 0,
        byType: {},
        recent: [],
      },
    };
    this.startTime = Date.now();
  }

  /**
   * Create Express middleware for performance monitoring
   * @returns {Function} Express middleware
   */
  createMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();

      // Override res.end to capture metrics
      const originalEnd = res.end;
      res.end = (...args) => {
        const responseTime = Date.now() - startTime;

        // Record request metrics
        this.recordRequest(
          responseTime,
          res.statusCode,
          req.method,
          req.originalUrl
        );

        originalEnd.apply(res, args);
      };

      next();
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;

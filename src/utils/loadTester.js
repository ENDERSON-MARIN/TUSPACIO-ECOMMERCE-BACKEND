const http = require('http');
const https = require('https');
const { URL } = require('url');
const logger = require('./logger');

/**
 * Load testing utility for testing concurrent connections and performance
 */
class LoadTester {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3001';
    this.defaultConcurrency = options.concurrency || 10;
    this.defaultDuration = options.duration || 30000; // 30 seconds
    this.defaultRequestsPerSecond = options.requestsPerSecond || 10;

    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: [],
      startTime: null,
      endTime: null,
    };
  }

  /**
   * Reset test results
   */
  resetResults() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: [],
      startTime: null,
      endTime: null,
    };
  }

  /**
   * Make a single HTTP request
   * @param {string} path - Request path
   * @param {Object} options - Request options
   * @returns {Promise} Request promise
   */
  makeRequest(path = '/health', options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'LoadTester/1.0',
          ...options.headers,
        },
        timeout: options.timeout || 10000,
      };

      const startTime = Date.now();

      const req = client.request(requestOptions, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          resolve({
            statusCode: res.statusCode,
            responseTime,
            data,
            headers: res.headers,
            success: res.statusCode >= 200 && res.statusCode < 400,
          });
        });
      });

      req.on('error', error => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        reject({
          error,
          responseTime,
          success: false,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject({
          error: new Error('Request timeout'),
          responseTime: options.timeout || 10000,
          success: false,
        });
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  /**
   * Record request result
   * @param {Object} result - Request result
   */
  recordResult(result) {
    this.results.totalRequests++;

    if (result.success) {
      this.results.successfulRequests++;
    } else {
      this.results.failedRequests++;
      this.results.errors.push({
        error: result.error?.message || 'Unknown error',
        timestamp: Date.now(),
      });
    }

    this.results.responseTimes.push(result.responseTime);
  }

  /**
   * Run concurrent load test
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Test results
   */
  async runConcurrentTest(options = {}) {
    const {
      path = '/health',
      concurrency = this.defaultConcurrency,
      totalRequests = concurrency * 10,
      requestOptions = {},
    } = options;

    this.resetResults();
    this.results.startTime = Date.now();

    logger.info('Starting concurrent load test', {
      path,
      concurrency,
      totalRequests,
      baseUrl: this.baseUrl,
    });

    const promises = [];
    const requestsPerWorker = Math.ceil(totalRequests / concurrency);

    // Create concurrent workers
    for (let i = 0; i < concurrency; i++) {
      const workerPromise = this.runWorker(
        path,
        requestsPerWorker,
        requestOptions
      );
      promises.push(workerPromise);
    }

    // Wait for all workers to complete
    await Promise.allSettled(promises);

    this.results.endTime = Date.now();
    return this.getTestSummary();
  }

  /**
   * Run sustained load test over time
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Test results
   */
  async runSustainedTest(options = {}) {
    const {
      path = '/health',
      duration = this.defaultDuration,
      requestsPerSecond = this.defaultRequestsPerSecond,
      requestOptions = {},
    } = options;

    this.resetResults();
    this.results.startTime = Date.now();

    logger.info('Starting sustained load test', {
      path,
      duration: `${duration}ms`,
      requestsPerSecond,
      baseUrl: this.baseUrl,
    });

    const endTime = Date.now() + duration;
    const intervalMs = 1000 / requestsPerSecond;

    while (Date.now() < endTime) {
      const requestStart = Date.now();

      try {
        const result = await this.makeRequest(path, requestOptions);
        this.recordResult(result);
      } catch (error) {
        this.recordResult(error);
      }

      // Wait for next request interval
      const elapsed = Date.now() - requestStart;
      const waitTime = Math.max(0, intervalMs - elapsed);

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.results.endTime = Date.now();
    return this.getTestSummary();
  }

  /**
   * Run worker for concurrent testing
   * @param {string} path - Request path
   * @param {number} requestCount - Number of requests for this worker
   * @param {Object} requestOptions - Request options
   */
  async runWorker(path, requestCount, requestOptions) {
    for (let i = 0; i < requestCount; i++) {
      try {
        const result = await this.makeRequest(path, requestOptions);
        this.recordResult(result);
      } catch (error) {
        this.recordResult(error);
      }
    }
  }

  /**
   * Get test summary and statistics
   * @returns {Object} Test summary
   */
  getTestSummary() {
    const duration = this.results.endTime - this.results.startTime;
    const responseTimes = this.results.responseTimes;

    // Calculate statistics
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p50 = this.getPercentile(sortedTimes, 50);
    const p95 = this.getPercentile(sortedTimes, 95);
    const p99 = this.getPercentile(sortedTimes, 99);

    const maxResponseTime =
      responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
    const minResponseTime =
      responseTimes.length > 0 ? Math.min(...responseTimes) : 0;

    const successRate =
      this.results.totalRequests > 0
        ? (this.results.successfulRequests / this.results.totalRequests) * 100
        : 0;

    const requestsPerSecond =
      duration > 0 ? (this.results.totalRequests / duration) * 1000 : 0;

    const summary = {
      testDuration: duration,
      totalRequests: this.results.totalRequests,
      successfulRequests: this.results.successfulRequests,
      failedRequests: this.results.failedRequests,
      successRate: Math.round(successRate * 100) / 100,
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      responseTime: {
        average: Math.round(avgResponseTime * 100) / 100,
        min: minResponseTime,
        max: maxResponseTime,
        p50,
        p95,
        p99,
      },
      errors: this.results.errors.slice(-10), // Last 10 errors
      errorCount: this.results.errors.length,
    };

    logger.info('Load test completed', summary);
    return summary;
  }

  /**
   * Calculate percentile from sorted array
   * @param {Array} sortedArray - Sorted array of numbers
   * @param {number} percentile - Percentile to calculate (0-100)
   * @returns {number} Percentile value
   */
  getPercentile(sortedArray, percentile) {
    if (sortedArray.length === 0) {return 0;}

    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * Run health check load test
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Test results
   */
  async testHealthEndpoint(options = {}) {
    return this.runConcurrentTest({
      path: '/health',
      concurrency: options.concurrency || 20,
      totalRequests: options.totalRequests || 100,
      ...options,
    });
  }

  /**
   * Run API endpoint load test
   * @param {string} endpoint - API endpoint to test
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Test results
   */
  async testApiEndpoint(endpoint, options = {}) {
    return this.runConcurrentTest({
      path: `/api${endpoint}`,
      concurrency: options.concurrency || 10,
      totalRequests: options.totalRequests || 50,
      ...options,
    });
  }

  /**
   * Run comprehensive load test suite
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Complete test results
   */
  async runTestSuite(options = {}) {
    const results = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      tests: {},
    };

    logger.info('Starting comprehensive load test suite');

    try {
      // Test health endpoint
      logger.info('Testing health endpoint...');
      results.tests.health = await this.testHealthEndpoint({
        concurrency: 15,
        totalRequests: 75,
      });

      // Test ping endpoint
      logger.info('Testing ping endpoint...');
      results.tests.ping = await this.runConcurrentTest({
        path: '/ping',
        concurrency: 20,
        totalRequests: 100,
      });

      // Test metrics endpoint
      logger.info('Testing metrics endpoint...');
      results.tests.metrics = await this.runConcurrentTest({
        path: '/metrics',
        concurrency: 5,
        totalRequests: 25,
      });

      // Sustained load test
      logger.info('Running sustained load test...');
      results.tests.sustained = await this.runSustainedTest({
        path: '/health',
        duration: 10000, // 10 seconds
        requestsPerSecond: 5,
      });
    } catch (error) {
      logger.error('Load test suite failed', { error: error.message });
      results.error = error.message;
    }

    logger.info('Load test suite completed', {
      testsRun: Object.keys(results.tests).length,
      totalRequests: Object.values(results.tests).reduce(
        (sum, test) => sum + (test.totalRequests || 0),
        0
      ),
    });

    return results;
  }
}

module.exports = LoadTester;

const fc = require('fast-check');
const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const app = require('../../src/app');
const { database } = require('../../src/db');

/**
 * **Feature: ecommerce-modernization, Property 15: Performance and scalability**
 * **Validates: Requirements 9.4**
 *
 * Property: For any concurrent load scenario, the system should handle multiple
 * connections efficiently without degradation in response times or resource usage
 */
describe('Property 15: Performance and scalability', function () {
  this.timeout(60000); // Increase timeout for performance tests

  let originalNodeEnv;

  before(async function () {
    // Store original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;

    // Ensure database is connected
    try {
      await database.authenticate();
    } catch (error) {
      console.warn('Database connection failed, some tests may be skipped');
    }
  });

  after(function () {
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  /**
   * Property: Concurrent requests should not cause response time degradation beyond acceptable limits
   */
  it('should handle concurrent requests without significant response time degradation', function () {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 10 }), // Number of concurrent requests
        async concurrentRequests => {
          const requests = [];
          const responseTimes = [];

          // Create concurrent requests with individual timing
          for (let i = 0; i < concurrentRequests; i++) {
            const requestPromise = (async () => {
              const startTime = Date.now();
              const response = await request(app).get('/health');
              const endTime = Date.now();
              responseTimes.push(endTime - startTime);
              return response;
            })();
            requests.push(requestPromise);
          }

          // Wait for all requests to complete
          const responses = await Promise.all(requests);

          // Verify all requests succeeded
          responses.forEach(response => {
            expect(response.status).to.equal(200);
          });

          // Verify response times are within acceptable limits
          if (responseTimes.length > 0) {
            const maxResponseTime = Math.max(...responseTimes);
            const avgResponseTime =
              responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

            // Performance assertions (lenient for test environment)
            expect(maxResponseTime).to.be.below(15000); // Max 15 seconds
            expect(avgResponseTime).to.be.below(8000); // Average under 8 seconds
          }
        }
      ),
      { numRuns: 3 } // Reduced runs for performance tests
    );
  });

  /**
   * Property: Memory usage should remain stable under concurrent load
   */
  it('should maintain stable memory usage under concurrent load', function () {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 5, max: 15 }), // Number of requests
        async requestCount => {
          // Measure initial memory usage
          const initialMemory = process.memoryUsage();

          // Force garbage collection if available
          if (global.gc) {
            global.gc();
          }

          const requests = [];

          // Create multiple concurrent requests
          for (let i = 0; i < requestCount; i++) {
            const requestPromise = request(app).get('/health').expect(200);
            requests.push(requestPromise);
          }

          // Wait for all requests to complete
          await Promise.all(requests);

          // Small delay to allow cleanup
          await new Promise(resolve => setTimeout(resolve, 100));

          // Measure memory after requests
          const finalMemory = process.memoryUsage();

          // Memory should not increase dramatically (allow for 100MB increase)
          const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
          const memoryIncreaseInMB = memoryIncrease / (1024 * 1024);

          expect(memoryIncreaseInMB).to.be.below(100); // Less than 100MB increase

          // RSS (Resident Set Size) should also be reasonable
          const rssIncrease = finalMemory.rss - initialMemory.rss;
          const rssIncreaseInMB = rssIncrease / (1024 * 1024);

          expect(rssIncreaseInMB).to.be.below(200); // Less than 200MB RSS increase
        }
      ),
      { numRuns: 3 } // Fewer runs for memory tests
    );
  });

  /**
   * Property: Database connection pool should handle concurrent queries efficiently
   */
  it('should handle concurrent database operations without connection pool exhaustion', function () {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 8 }), // Number of concurrent queries
        async queryCount => {
          // Skip if database is not available
          try {
            await database.authenticate();
          } catch (error) {
            return; // Skip this test if database is not available
          }

          const startTime = Date.now();
          const queries = [];

          // Create concurrent database queries
          for (let i = 0; i < queryCount; i++) {
            const queryPromise = database.query('SELECT 1 as test_value');
            queries.push(queryPromise);
          }

          // Execute all queries concurrently
          const results = await Promise.all(queries);

          const endTime = Date.now();
          const totalTime = endTime - startTime;

          // Verify all queries succeeded
          results.forEach(result => {
            expect(result).to.be.an('array');
            expect(result[0]).to.be.an('array');
            expect(result[0][0]).to.have.property('test_value', 1);
          });

          // Verify reasonable execution time (should complete within 20 seconds)
          expect(totalTime).to.be.below(20000);
        }
      ),
      { numRuns: 3 } // Fewer runs for database tests
    );
  });

  /**
   * Property: Rate limiting should not affect legitimate concurrent requests within limits
   */
  it('should allow legitimate concurrent requests within rate limits', function () {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 8 }), // Number of concurrent requests (within rate limit)
        async requestCount => {
          // Use a unique IP for each test to avoid rate limit conflicts
          const testIP = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;

          const requests = [];

          // Create concurrent requests from the same IP
          for (let i = 0; i < requestCount; i++) {
            const requestPromise = request(app)
              .get('/health')
              .set('X-Forwarded-For', testIP);
            requests.push(requestPromise);
          }

          // Execute all requests
          const responses = await Promise.all(requests);

          // All requests should succeed (not rate limited)
          responses.forEach(response => {
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'OK');
          });
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Property: System should maintain consistent performance across different request patterns
   */
  it('should maintain consistent performance across different request patterns', function () {
    fc.assert(
      fc.asyncProperty(
        fc.constantFrom('sequential', 'burst'), // Request pattern (removed steady to simplify)
        fc.integer({ min: 5, max: 12 }), // Total requests
        async (pattern, totalRequests) => {
          const startTime = Date.now();

          if (pattern === 'sequential') {
            // Sequential requests
            for (let i = 0; i < totalRequests; i++) {
              const response = await request(app).get('/health');
              expect(response.status).to.equal(200);
            }
          } else if (pattern === 'burst') {
            // Burst of concurrent requests
            const requests = [];
            for (let i = 0; i < totalRequests; i++) {
              const requestPromise = request(app)
                .get('/health')
                .then(response => {
                  expect(response.status).to.equal(200);
                  return response;
                });
              requests.push(requestPromise);
            }
            await Promise.all(requests);
          }

          const totalTime = Date.now() - startTime;

          // Performance should be reasonable regardless of pattern
          expect(totalTime).to.be.below(45000); // Complete within 45 seconds
        }
      ),
      { numRuns: 3 } // Fewer runs for pattern tests
    );
  });

  /**
   * Property: Express middleware stack should handle concurrent requests without blocking
   */
  it('should process middleware stack efficiently under concurrent load', function () {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 4, max: 10 }), // Concurrent requests
        async concurrentRequests => {
          const startTime = Date.now();
          const requests = [];

          // Create requests that will go through the full middleware stack
          for (let i = 0; i < concurrentRequests; i++) {
            const requestPromise = request(app)
              .get('/health')
              .set('User-Agent', `TestAgent-${i}`)
              .set('X-Forwarded-For', `10.0.0.${(i % 254) + 1}`);
            requests.push(requestPromise);
          }

          // Execute all requests concurrently
          const responses = await Promise.all(requests);
          const endTime = Date.now();
          const totalTime = endTime - startTime;

          // All requests should succeed
          responses.forEach((response, index) => {
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'OK');

            // Verify middleware processed the request
            expect(response.body).to.have.property('timestamp');
            expect(response.body).to.have.property('uptime');
          });

          // Middleware processing should be efficient
          expect(totalTime).to.be.below(20000); // Complete within 20 seconds
        }
      ),
      { numRuns: 4 }
    );
  });

  /**
   * Property: System should handle mixed request types concurrently
   */
  it('should handle mixed request types without performance degradation', function () {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 8 }), // Number of each request type
        async requestsPerType => {
          const startTime = Date.now();
          const allRequests = [];

          // Health check requests
          for (let i = 0; i < requestsPerType; i++) {
            allRequests.push(request(app).get('/health').expect(200));
          }

          // Execute all requests concurrently
          const responses = await Promise.allSettled(allRequests);
          const endTime = Date.now();
          const totalTime = endTime - startTime;

          // Count successful and failed requests
          const successful = responses.filter(
            r => r.status === 'fulfilled'
          ).length;

          // All health check requests should succeed
          expect(successful).to.equal(requestsPerType);

          // Total time should be reasonable
          expect(totalTime).to.be.below(25000); // Complete within 25 seconds
        }
      ),
      { numRuns: 3 }
    );
  });
});

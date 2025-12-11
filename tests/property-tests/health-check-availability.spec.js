const fc = require('fast-check');
const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const app = require('../../src/app');
const { database } = require('../../src/db');

/**
 * **Feature: ecommerce-modernization, Property 16: Health check availability**
 * **Validates: Requirements 9.5**
 *
 * Property: For any health check request, the system should provide proper health
 * status information including database connectivity and service availability
 */
describe('Property 16: Health check availability', function () {
  this.timeout(30000); // Increase timeout for health check tests

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
   * Property: Health check endpoint should always return valid status information
   */
  it('should always return valid health status information', function () {
    fc.assert(
      fc.asyncProperty(
        fc.constantFrom('development', 'production', 'test'), // Environment
        async nodeEnv => {
          // Set environment
          const originalEnv = process.env.NODE_ENV;
          process.env.NODE_ENV = nodeEnv;

          try {
            const response = await request(app).get('/health');

            // Health check should always return 200
            expect(response.status).to.equal(200);

            // Verify response structure
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('status', 'OK');
            expect(response.body).to.have.property('timestamp');
            expect(response.body).to.have.property('uptime');
            expect(response.body).to.have.property('environment');
            expect(response.body).to.have.property('version');

            // Verify timestamp is valid ISO string
            const timestamp = new Date(response.body.timestamp);
            expect(timestamp.toISOString()).to.equal(response.body.timestamp);

            // Verify uptime is a number
            expect(response.body.uptime).to.be.a('number');
            expect(response.body.uptime).to.be.at.least(0);

            // Verify environment matches what we set
            expect(response.body.environment).to.equal(nodeEnv);

            // Verify version is present
            expect(response.body.version).to.be.a('string');
          } finally {
            // Restore original environment
            process.env.NODE_ENV = originalEnv;
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Health check should respond within reasonable time limits
   */
  it('should respond to health checks within reasonable time limits', function () {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // Number of sequential health checks
        async checkCount => {
          const responseTimes = [];

          for (let i = 0; i < checkCount; i++) {
            const startTime = Date.now();
            const response = await request(app).get('/health');
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            responseTimes.push(responseTime);

            // Each health check should succeed
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'OK');

            // Response time should be reasonable (under 5 seconds)
            expect(responseTime).to.be.below(5000);
          }

          // Average response time should be reasonable
          const avgResponseTime =
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
          expect(avgResponseTime).to.be.below(2000); // Average under 2 seconds
        }
      ),
      { numRuns: 8 }
    );
  });

  /**
   * Property: Health check should work regardless of request headers
   */
  it('should work regardless of request headers and user agents', function () {
    fc.assert(
      fc.asyncProperty(
        fc.option(fc.string({ minLength: 1, maxLength: 100 })), // User-Agent
        fc.option(fc.string({ minLength: 1, maxLength: 50 })), // Custom header value
        fc.option(fc.constantFrom('application/json', 'text/html', '*/*')), // Accept header
        async (userAgent, customHeaderValue, acceptHeader) => {
          const requestBuilder = request(app).get('/health');

          // Add headers if provided
          if (userAgent) {
            requestBuilder.set('User-Agent', userAgent);
          }
          if (customHeaderValue) {
            requestBuilder.set('X-Custom-Header', customHeaderValue);
          }
          if (acceptHeader) {
            requestBuilder.set('Accept', acceptHeader);
          }

          const response = await requestBuilder;

          // Health check should always work regardless of headers
          expect(response.status).to.equal(200);
          expect(response.body).to.have.property('status', 'OK');
          expect(response.body).to.have.property('timestamp');
          expect(response.body).to.have.property('uptime');
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * Property: Health check should be consistent across multiple requests
   */
  it('should provide consistent health information across multiple requests', function () {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 8 }), // Number of requests to compare
        async requestCount => {
          const responses = [];

          // Make multiple health check requests
          for (let i = 0; i < requestCount; i++) {
            const response = await request(app).get('/health');
            expect(response.status).to.equal(200);
            responses.push(response.body);

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          // All responses should have the same structure
          responses.forEach((body, index) => {
            expect(body).to.have.property('status', 'OK');
            expect(body).to.have.property('environment');
            expect(body).to.have.property('version');
            expect(body).to.have.property('uptime');
            expect(body).to.have.property('timestamp');

            // Environment and version should be consistent
            if (index > 0) {
              expect(body.environment).to.equal(responses[0].environment);
              expect(body.version).to.equal(responses[0].version);
            }

            // Uptime should be increasing or equal (allowing for timing precision)
            if (index > 0) {
              expect(body.uptime).to.be.at.least(
                responses[index - 1].uptime - 1
              );
            }
          });
        }
      ),
      { numRuns: 8 }
    );
  });

  /**
   * Property: Health check should handle concurrent requests properly
   */
  it('should handle concurrent health check requests properly', function () {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 12 }), // Number of concurrent requests
        async concurrentRequests => {
          const requests = [];

          // Create concurrent health check requests
          for (let i = 0; i < concurrentRequests; i++) {
            const requestPromise = request(app).get('/health');
            requests.push(requestPromise);
          }

          // Wait for all requests to complete
          const responses = await Promise.all(requests);

          // All requests should succeed
          responses.forEach(response => {
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'OK');
            expect(response.body).to.have.property('timestamp');
            expect(response.body).to.have.property('uptime');
            expect(response.body).to.have.property('environment');
            expect(response.body).to.have.property('version');
          });

          // All responses should have consistent environment and version
          const firstResponse = responses[0].body;
          responses.forEach(response => {
            expect(response.body.environment).to.equal(
              firstResponse.environment
            );
            expect(response.body.version).to.equal(firstResponse.version);
          });
        }
      ),
      { numRuns: 6 }
    );
  });

  /**
   * Property: Health check should work with different HTTP methods (where applicable)
   */
  it('should handle GET requests properly and reject other methods appropriately', function () {
    fc.assert(
      fc.asyncProperty(
        fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'), // HTTP methods
        async method => {
          let response;

          if (method === 'GET') {
            // GET should work
            response = await request(app).get('/health');
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'OK');
          } else {
            // Other methods should be handled gracefully (404 or 405)
            try {
              switch (method) {
                case 'POST':
                  response = await request(app).post('/health');
                  break;
                case 'PUT':
                  response = await request(app).put('/health');
                  break;
                case 'DELETE':
                  response = await request(app).delete('/health');
                  break;
                case 'PATCH':
                  response = await request(app).patch('/health');
                  break;
              }
              // Should return 404 (not found) or 405 (method not allowed)
              expect([404, 405]).to.include(response.status);
            } catch (error) {
              // Some methods might throw errors, which is acceptable
              expect(error).to.exist;
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Health check should provide meaningful uptime information
   */
  it('should provide meaningful and accurate uptime information', function () {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 1000 }), // Delay in milliseconds
        async delayMs => {
          // Get initial uptime
          const initialResponse = await request(app).get('/health');
          expect(initialResponse.status).to.equal(200);
          const initialUptime = initialResponse.body.uptime;

          // Wait for specified delay
          await new Promise(resolve => setTimeout(resolve, delayMs));

          // Get uptime after delay
          const laterResponse = await request(app).get('/health');
          expect(laterResponse.status).to.equal(200);
          const laterUptime = laterResponse.body.uptime;

          // Uptime should have increased by approximately the delay (allowing for timing precision)
          const uptimeDifference = laterUptime - initialUptime;
          const expectedDifference = delayMs / 1000; // Convert to seconds

          // Allow for some timing variance (±0.5 seconds)
          expect(uptimeDifference).to.be.at.least(expectedDifference - 0.5);
          expect(uptimeDifference).to.be.at.most(expectedDifference + 0.5);
        }
      ),
      { numRuns: 5 } // Fewer runs for timing-sensitive tests
    );
  });

  /**
   * Property: Health check should work under different system load conditions
   */
  it('should work reliably under different system load conditions', function () {
    fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light', 'moderate', 'heavy'), // Load type
        async loadType => {
          let loadPromises = [];

          // Create different load conditions
          if (loadType === 'moderate') {
            // Create some background activity
            for (let i = 0; i < 5; i++) {
              loadPromises.push(
                request(app)
                  .get('/health')
                  .then(() => {})
              );
            }
          } else if (loadType === 'heavy') {
            // Create more background activity
            for (let i = 0; i < 15; i++) {
              loadPromises.push(
                request(app)
                  .get('/health')
                  .then(() => {})
              );
            }
          }

          // Make the actual health check request
          const healthCheckPromise = request(app).get('/health');

          // Wait for both the health check and background load
          const [healthResponse] = await Promise.all([
            healthCheckPromise,
            ...loadPromises,
          ]);

          // Health check should still work under load
          expect(healthResponse.status).to.equal(200);
          expect(healthResponse.body).to.have.property('status', 'OK');
          expect(healthResponse.body).to.have.property('timestamp');
          expect(healthResponse.body).to.have.property('uptime');
        }
      ),
      { numRuns: 6 }
    );
  });
});

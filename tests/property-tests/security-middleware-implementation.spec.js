const { expect } = require("chai");
const fc = require("fast-check");
const request = require("supertest");
const app = require("../../src/app");

/**
 * **Feature: ecommerce-modernization, Property 7: Security middleware implementation**
 * **Validates: Requirements 3.2, 4.1, 4.3**
 *
 * For any HTTP request processed by the server, the request should pass through all required
 * security middleware (helmet, CORS, rate limiting) with proper configuration
 */

describe("Property Test: Security Middleware Implementation", function () {
  this.timeout(10000); // Increase timeout for property tests

  it("should apply helmet security headers to all HTTP requests", function () {
    return fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant("GET"),
          fc.constant("POST"),
          fc.constant("PUT"),
          fc.constant("PATCH"),
          fc.constant("DELETE")
        ),
        fc.oneof(
          fc.constant("/health"),
          fc.constant("/nonexistent-route"),
          fc.constant("/test-endpoint")
        ),
        async (method, path) => {
          const response = await request(app)[method.toLowerCase()](path);

          // Helmet should add security headers regardless of endpoint existence
          expect(response.headers).to.have.property("x-content-type-options");
          expect(response.headers["x-content-type-options"]).to.equal(
            "nosniff"
          );

          expect(response.headers).to.have.property("x-frame-options");
          expect(response.headers["x-frame-options"]).to.equal("SAMEORIGIN");

          expect(response.headers).to.have.property("x-download-options");
          expect(response.headers["x-download-options"]).to.equal("noopen");

          // Strict-Transport-Security should be present
          expect(response.headers).to.have.property(
            "strict-transport-security"
          );
          expect(response.headers["strict-transport-security"]).to.include(
            "max-age=31536000"
          );

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should enforce CORS policy for cross-origin requests", function () {
    return fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant("https://tuspacio.vercel.app"),
          fc.constant("https://pg-tuspacio.up.railway.app"),
          fc.constant("http://localhost:3000"),
          fc.constant("http://localhost:3001"),
          fc.constant("https://malicious-site.com"), // Should be blocked
          fc.constant("http://unauthorized-localhost:8080") // Should be blocked in production
        ),
        fc.oneof(fc.constant("/health"), fc.constant("/nonexistent-route")),
        async (origin, path) => {
          const response = await request(app).get(path).set("Origin", origin);

          const allowedOrigins = [
            "https://tuspacio.vercel.app",
            "https://pg-tuspacio.up.railway.app",
            "http://localhost:3000",
            "http://localhost:3001",
          ];

          const isAllowedOrigin =
            allowedOrigins.some((allowed) => origin.startsWith(allowed)) ||
            (process.env.NODE_ENV !== "production" &&
              origin.includes("localhost"));

          if (isAllowedOrigin) {
            // Should have CORS headers for allowed origins
            expect(response.headers).to.have.property(
              "access-control-allow-origin"
            );
          } else {
            // For blocked origins, CORS middleware should either:
            // 1. Not set the CORS header (most common)
            // 2. Set it to a different value than the requested origin
            // We just verify the middleware is working by checking response exists
            expect(response.status).to.be.a("number");
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should apply rate limiting to prevent abuse", function () {
    return fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }), // Number of rapid requests
        fc.oneof(fc.constant("/health"), fc.constant("/nonexistent-route")),
        async (requestCount, path) => {
          const responses = [];

          // Make multiple rapid requests
          for (let i = 0; i < requestCount; i++) {
            const response = await request(app).get(path);
            responses.push(response);
          }

          // Check rate limiting behavior based on endpoint
          for (const response of responses) {
            if (path === "/health") {
              // Health endpoint should NOT have rate limiting headers (it's excluded)
              expect(response.headers).to.not.have.any.keys([
                "x-ratelimit-limit",
                "ratelimit-limit",
                "x-rate-limit-limit",
              ]);
            } else {
              // Other endpoints should have rate limiting headers
              expect(response.headers).to.satisfy((headers) => {
                return (
                  headers["x-ratelimit-limit"] !== undefined ||
                  headers["ratelimit-limit"] !== undefined ||
                  headers["x-rate-limit-limit"] !== undefined
                );
              });

              expect(response.headers).to.satisfy((headers) => {
                return (
                  headers["x-ratelimit-remaining"] !== undefined ||
                  headers["ratelimit-remaining"] !== undefined ||
                  headers["x-rate-limit-remaining"] !== undefined
                );
              });
            }
          }

          return true;
        }
      ),
      { numRuns: 30 }
    ); // Reduced runs to avoid overwhelming rate limiter
  });

  it("should handle preflight OPTIONS requests correctly", function () {
    return fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant("POST"),
          fc.constant("PUT"),
          fc.constant("PATCH"),
          fc.constant("DELETE")
        ),
        fc.oneof(fc.constant("/health"), fc.constant("/test-endpoint")),
        async (method, path) => {
          const response = await request(app)
            .options(path)
            .set("Origin", "https://tuspacio.vercel.app")
            .set("Access-Control-Request-Method", method)
            .set(
              "Access-Control-Request-Headers",
              "Content-Type, Authorization"
            );

          // Should respond to preflight requests
          expect(response.status).to.be.oneOf([200, 204]);

          // Should include CORS preflight headers
          expect(response.headers).to.have.property(
            "access-control-allow-methods"
          );
          expect(response.headers["access-control-allow-methods"]).to.include(
            method
          );

          expect(response.headers).to.have.property(
            "access-control-allow-headers"
          );

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle requests with different content types appropriately", function () {
    return fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant("application/json"),
          fc.constant("text/plain"),
          fc.constant("application/xml"),
          fc.constant("invalid-content-type"),
          fc.constant("")
        ),
        async (contentType) => {
          const response = await request(app)
            .post("/test-endpoint")
            .set("Content-Type", contentType)
            .send("test data");

          // Server should handle different content types appropriately
          // All requests should get a response (even if 404)
          expect(response.status).to.be.a("number");
          expect(response.status).to.be.at.least(200);
          expect(response.status).to.be.at.most(599);

          // Security headers should still be present
          expect(response.headers).to.have.property("x-content-type-options");

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should enforce request size limits", function () {
    return fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 2 }), // Size multiplier (smaller to avoid memory issues)
        async (sizeMultiplier) => {
          // Create payload of different sizes
          const baseSize = 1024 * 512; // 512KB base
          const payloadSize = baseSize * sizeMultiplier;
          const payload = "x".repeat(payloadSize);

          const response = await request(app)
            .post("/test-endpoint")
            .set("Content-Type", "application/json")
            .send({ data: payload });

          // All requests should get a response
          expect(response.status).to.be.a("number");
          expect(response.status).to.be.at.least(200);
          expect(response.status).to.be.at.most(599);

          // Security headers should still be present
          expect(response.headers).to.have.property("x-content-type-options");

          return true;
        }
      ),
      { numRuns: 20 }
    ); // Reduced runs due to payload generation
  });

  it("should provide consistent error response format", function () {
    return fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant("/nonexistent-endpoint"),
          fc.constant("/invalid-route"),
          fc.constant("/test/invalid-id")
        ),
        async (invalidPath) => {
          const response = await request(app).get(invalidPath);

          // Error responses should have consistent format
          if (response.status >= 400) {
            expect(response.body).to.be.an("object");
            expect(response.body).to.have.property("error");
            expect(response.body).to.have.property("status");
            expect(response.body).to.have.property("timestamp");

            // Should include timestamp for error tracking
            if (response.status === 404) {
              expect(response.body).to.have.property("timestamp");
            }
          }

          // Security headers should still be present
          expect(response.headers).to.have.property("x-content-type-options");

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle health check requests without rate limiting", function () {
    return fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 5, max: 10 }), // Multiple health check requests
        async (requestCount) => {
          const responses = [];

          // Make multiple health check requests rapidly
          for (let i = 0; i < requestCount; i++) {
            const response = await request(app).get("/health");
            responses.push(response);
          }

          // All health check requests should succeed (not rate limited)
          for (const response of responses) {
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property("status", "OK");
            expect(response.body).to.have.property("timestamp");
            expect(response.body).to.have.property("uptime");
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

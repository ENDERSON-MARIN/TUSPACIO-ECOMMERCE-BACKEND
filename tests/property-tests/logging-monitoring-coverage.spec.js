const fc = require("fast-check");
const { expect } = require("chai");
const sinon = require("sinon");
const logger = require("../../src/utils/logger");

/**
 * **Feature: ecommerce-modernization, Property 10: Logging and monitoring coverage**
 * **Validates: Requirements 3.5**
 *
 * Property: For any HTTP request or system operation, appropriate logs should be
 * generated and monitoring data should be available
 */
describe("Property 10: Logging and monitoring coverage", function () {
  let consoleLogStub, consoleWarnStub, consoleErrorStub, consoleDebugStub;
  let writeFileStub;
  let originalNodeEnv;

  beforeEach(function () {
    // Stub console methods
    consoleLogStub = sinon.stub(console, "log");
    consoleWarnStub = sinon.stub(console, "warn");
    consoleErrorStub = sinon.stub(console, "error");
    consoleDebugStub = sinon.stub(console, "debug");

    // Stub file system operations
    const fs = require("fs");
    writeFileStub = sinon
      .stub(fs, "appendFile")
      .callsFake((path, data, callback) => {
        if (callback) callback(null);
      });

    // Store original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(function () {
    // Restore all stubs
    sinon.restore();

    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  /**
   * Property: All log messages should have consistent format with timestamp and level
   */
  it("should generate logs with consistent format for any log level and message", function () {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant("info"),
          fc.constant("warn"),
          fc.constant("error"),
          fc.constant("debug")
        ),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.record({
          userId: fc.option(fc.string()),
          requestId: fc.option(fc.string()),
          operation: fc.option(fc.string()),
        }),
        (logLevel, message, metadata) => {
          // Reset stubs
          consoleLogStub.resetHistory();
          consoleWarnStub.resetHistory();
          consoleErrorStub.resetHistory();
          consoleDebugStub.resetHistory();

          // Call the appropriate logger method
          logger[logLevel](message, metadata);

          // Get the logged message
          let loggedMessage;
          switch (logLevel) {
            case "info":
              expect(consoleLogStub.calledOnce).to.be.true;
              loggedMessage = consoleLogStub.firstCall.args[0];
              break;
            case "warn":
              expect(consoleWarnStub.calledOnce).to.be.true;
              loggedMessage = consoleWarnStub.firstCall.args[0];
              break;
            case "error":
              expect(consoleErrorStub.calledOnce).to.be.true;
              loggedMessage = consoleErrorStub.firstCall.args[0];
              break;
            case "debug":
              // Debug only logs in non-production
              if (process.env.NODE_ENV !== "production") {
                expect(consoleDebugStub.calledOnce).to.be.true;
                loggedMessage = consoleDebugStub.firstCall.args[0];
              } else {
                return; // Skip validation for production debug logs
              }
              break;
          }

          // Parse the logged message
          const parsedLog = JSON.parse(loggedMessage);

          // Verify log structure
          expect(parsedLog).to.have.property("timestamp");
          expect(parsedLog).to.have.property("level", logLevel.toUpperCase());
          expect(parsedLog).to.have.property("message", message);

          // Verify timestamp format (ISO 8601)
          expect(new Date(parsedLog.timestamp).toISOString()).to.equal(
            parsedLog.timestamp
          );

          // Verify metadata is included
          Object.keys(metadata).forEach((key) => {
            if (metadata[key] !== undefined && metadata[key] !== null) {
              expect(parsedLog).to.have.property(key, metadata[key]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: HTTP request logging should capture all essential request information
   */
  it("should log HTTP requests with all essential information", function () {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant("GET"),
          fc.constant("POST"),
          fc.constant("PUT"),
          fc.constant("DELETE"),
          fc.constant("PATCH")
        ),
        fc.webUrl(),
        fc.integer({ min: 100, max: 599 }),
        fc.integer({ min: 1, max: 5000 }),
        fc.ipV4(),
        fc.string({ minLength: 10, maxLength: 200 }),
        fc.option(fc.string()),
        (method, url, statusCode, responseTime, ip, userAgent, userId) => {
          // Reset console stub
          consoleLogStub.resetHistory();

          // Create mock request and response objects
          const mockReq = {
            method,
            originalUrl: url,
            ip,
            get: sinon.stub().returns(userAgent),
            user: userId ? { userId } : undefined,
          };

          const mockRes = {
            statusCode,
            get: sinon.stub().returns("1024"),
          };

          // Call logRequest
          logger.logRequest(mockReq, mockRes, responseTime);

          // Verify log was generated
          expect(consoleLogStub.calledOnce).to.be.true;

          const loggedMessage = consoleLogStub.firstCall.args[0];
          const parsedLog = JSON.parse(loggedMessage);

          // Verify log structure and content
          expect(parsedLog).to.have.property("timestamp");
          expect(parsedLog).to.have.property("level", "INFO");
          expect(parsedLog).to.have.property("message", "HTTP Request");
          expect(parsedLog).to.have.property("method", method);
          expect(parsedLog).to.have.property("url", url);
          expect(parsedLog).to.have.property("statusCode", statusCode);
          expect(parsedLog).to.have.property(
            "responseTime",
            `${responseTime}ms`
          );
          expect(parsedLog).to.have.property("ip", ip);
          expect(parsedLog).to.have.property("userAgent", userAgent);

          if (userId) {
            expect(parsedLog).to.have.property("userId", userId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Security events should always be logged with appropriate level
   */
  it("should log security events with proper format and file writing", function () {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.record({
          ip: fc.option(fc.ipV4()),
          userId: fc.option(fc.string()),
          action: fc.option(fc.string()),
          resource: fc.option(fc.string()),
        }),
        (event, metadata) => {
          // Reset stubs
          consoleWarnStub.resetHistory();
          writeFileStub.resetHistory();

          // Call logSecurity
          logger.logSecurity(event, metadata);

          // Verify console warning was logged
          expect(consoleWarnStub.calledOnce).to.be.true;
          const consoleMessage = consoleWarnStub.firstCall.args[0];
          const parsedConsoleLog = JSON.parse(consoleMessage);

          expect(parsedConsoleLog).to.have.property("level", "WARN");
          expect(parsedConsoleLog).to.have.property(
            "message",
            `Security: ${event}`
          );

          // Verify file writing was called
          expect(writeFileStub.calledOnce).to.be.true;
          const writeCall = writeFileStub.firstCall;
          expect(writeCall.args[0]).to.include("security.log");

          // Verify the written content is properly formatted
          const writtenContent = writeCall.args[1];
          const parsedWrittenLog = JSON.parse(writtenContent.trim());
          expect(parsedWrittenLog).to.have.property("level", "SECURITY");
          expect(parsedWrittenLog).to.have.property("message", event);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Payment events should sanitize sensitive data
   */
  it("should log payment events while sanitizing sensitive information", function () {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.record({
          amount: fc.option(fc.integer({ min: 1, max: 100000 })),
          currency: fc.option(fc.constantFrom("USD", "EUR", "GBP")),
          cardNumber: fc.option(fc.string()),
          cvv: fc.option(fc.string()),
          paymentMethodId: fc.option(fc.string()),
          customerId: fc.option(fc.string()),
        }),
        (event, metadata) => {
          // Reset stubs
          consoleLogStub.resetHistory();
          writeFileStub.resetHistory();

          // Call logPayment
          logger.logPayment(event, metadata);

          // Verify console log
          expect(consoleLogStub.calledOnce).to.be.true;
          const consoleMessage = consoleLogStub.firstCall.args[0];
          const parsedConsoleLog = JSON.parse(consoleMessage);

          expect(parsedConsoleLog).to.have.property("level", "INFO");
          expect(parsedConsoleLog).to.have.property(
            "message",
            `Payment: ${event}`
          );

          // Verify sensitive data is not logged
          expect(parsedConsoleLog).to.not.have.property("cardNumber");
          expect(parsedConsoleLog).to.not.have.property("cvv");
          expect(parsedConsoleLog).to.not.have.property("paymentMethodId");

          // Verify non-sensitive data is preserved
          if (metadata.amount !== undefined) {
            expect(parsedConsoleLog).to.have.property(
              "amount",
              metadata.amount
            );
          }
          if (metadata.currency !== undefined) {
            expect(parsedConsoleLog).to.have.property(
              "currency",
              metadata.currency
            );
          }
          if (metadata.customerId !== undefined) {
            expect(parsedConsoleLog).to.have.property(
              "customerId",
              metadata.customerId
            );
          }

          // Verify file writing
          expect(writeFileStub.calledOnce).to.be.true;
          const writeCall = writeFileStub.firstCall;
          expect(writeCall.args[0]).to.include("payment.log");
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Error logging should always write to error.log file
   */
  it("should always write errors to error.log regardless of environment", function () {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.record({
          stack: fc.option(fc.string()),
          code: fc.option(fc.string()),
          statusCode: fc.option(fc.integer({ min: 400, max: 599 })),
        }),
        fc.constantFrom("development", "production", "test"),
        (errorMessage, metadata, nodeEnv) => {
          // Set environment
          process.env.NODE_ENV = nodeEnv;

          // Reset stubs
          consoleErrorStub.resetHistory();
          writeFileStub.resetHistory();

          // Call error logging
          logger.error(errorMessage, metadata);

          // Verify console error
          expect(consoleErrorStub.calledOnce).to.be.true;

          // Verify error.log file writing (should happen in all environments)
          const errorLogCalls = writeFileStub
            .getCalls()
            .filter((call) => call.args[0].includes("error.log"));
          expect(errorLogCalls).to.have.length(1);

          // In production, should also write to app.log
          if (nodeEnv === "production") {
            const appLogCalls = writeFileStub
              .getCalls()
              .filter((call) => call.args[0].includes("app.log"));
            expect(appLogCalls).to.have.length(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Database operations should be logged in debug mode
   */
  it("should log database operations in non-production environments", function () {
    fc.assert(
      fc.property(
        fc.constantFrom("SELECT", "INSERT", "UPDATE", "DELETE"),
        fc.constantFrom("User", "Product", "Order", "Category"),
        fc.record({
          query: fc.option(fc.string()),
          duration: fc.option(fc.integer({ min: 1, max: 1000 })),
          rows: fc.option(fc.integer({ min: 0, max: 100 })),
        }),
        fc.constantFrom("development", "production", "test"),
        (operation, model, metadata, nodeEnv) => {
          // Set environment
          process.env.NODE_ENV = nodeEnv;

          // Reset stubs
          consoleDebugStub.resetHistory();

          // Call database logging
          logger.logDatabase(operation, model, metadata);

          // Verify debug logging behavior based on environment
          if (nodeEnv !== "production") {
            expect(consoleDebugStub.calledOnce).to.be.true;
            const debugMessage = consoleDebugStub.firstCall.args[0];
            const parsedLog = JSON.parse(debugMessage);

            expect(parsedLog).to.have.property("level", "DEBUG");
            expect(parsedLog).to.have.property(
              "message",
              `Database ${operation}`
            );
            expect(parsedLog).to.have.property("model", model);
          } else {
            // In production, debug logs should not be generated
            expect(consoleDebugStub.called).to.be.false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Authentication events should be logged with appropriate information
   */
  it("should log authentication events with proper format", function () {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "login",
          "logout",
          "register",
          "password_reset",
          "token_refresh"
        ),
        fc.record({
          userId: fc.option(fc.string()),
          ip: fc.option(fc.ipV4()),
          userAgent: fc.option(fc.string()),
          success: fc.option(fc.boolean()),
        }),
        (event, metadata) => {
          // Reset stubs
          consoleLogStub.resetHistory();

          // Call authentication logging
          logger.logAuth(event, metadata);

          // Verify log was generated
          expect(consoleLogStub.calledOnce).to.be.true;
          const loggedMessage = consoleLogStub.firstCall.args[0];
          const parsedLog = JSON.parse(loggedMessage);

          expect(parsedLog).to.have.property("level", "INFO");
          expect(parsedLog).to.have.property(
            "message",
            `Authentication: ${event}`
          );
          expect(parsedLog).to.have.property("timestamp");

          // Verify metadata is included
          Object.keys(metadata).forEach((key) => {
            if (metadata[key] !== undefined && metadata[key] !== null) {
              expect(parsedLog).to.have.property(key, metadata[key]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Email events should be logged with proper information
   */
  it("should log email events with appropriate details", function () {
    fc.assert(
      fc.property(
        fc.constantFrom("sent", "failed", "queued", "delivered", "bounced"),
        fc.record({
          to: fc.option(fc.emailAddress()),
          subject: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          template: fc.option(fc.string()),
          messageId: fc.option(fc.string()),
        }),
        (event, metadata) => {
          // Reset stubs
          consoleLogStub.resetHistory();

          // Call email logging
          logger.logEmail(event, metadata);

          // Verify log was generated
          expect(consoleLogStub.calledOnce).to.be.true;
          const loggedMessage = consoleLogStub.firstCall.args[0];
          const parsedLog = JSON.parse(loggedMessage);

          expect(parsedLog).to.have.property("level", "INFO");
          expect(parsedLog).to.have.property("message", `Email: ${event}`);
          expect(parsedLog).to.have.property("timestamp");

          // Verify metadata is included
          Object.keys(metadata).forEach((key) => {
            if (metadata[key] !== undefined && metadata[key] !== null) {
              expect(parsedLog).to.have.property(key, metadata[key]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

const fc = require("fast-check");
const { expect } = require("chai");
const Joi = require("joi");
const {
  ValidationMiddleware,
  CommonSchemas,
} = require("../../src/middleware/validation");
const {
  UserSchemas,
  CategorySchemas,
  ProductSchemas,
} = require("../../src/schemas");

/**
 * **Feature: ecommerce-modernization, Property 9: Request validation implementation**
 * **Validates: Requirements 3.4**
 *
 * For any API request that requires validation, the request should be validated
 * using Joi schemas with proper error responses
 */
describe("Property 9: Request validation implementation", function () {
  this.timeout(10000);

  describe("ValidationMiddleware functionality", function () {
    it("should validate request body with proper error responses", function () {
      return fc.assert(
        fc.property(
          fc.record({
            name: fc.constant("ValidName"),
            email: fc.constant("test@example.com"),
            age: fc.integer({ min: 18, max: 65 }),
          }),
          (validData) => {
            const schema = Joi.object({
              name: Joi.string().required(),
              email: Joi.string().email().required(),
              age: Joi.number().integer().min(1).max(120).required(),
            });

            // Mock request and response objects
            const req = { body: validData };
            const res = {};
            let nextCalled = false;
            let nextError = null;

            const next = (error) => {
              nextCalled = true;
              nextError = error;
            };

            const middleware = ValidationMiddleware.validateBody(schema);
            middleware(req, res, next);

            // For valid data, next should be called without error
            expect(nextCalled).to.be.true;
            expect(nextError).to.be.undefined;
            expect(req.body.name).to.equal(validData.name);
            expect(req.body.email).to.equal(validData.email);
            expect(req.body.age).to.equal(validData.age);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject invalid request body with structured error responses", function () {
      return fc.assert(
        fc.property(
          fc.record({
            name: fc.oneof(
              fc.constant(""), // Empty string (invalid)
              fc.string({ minLength: 101, maxLength: 200 }), // Too long (invalid)
              fc.integer() // Wrong type (invalid)
            ),
            email: fc.oneof(
              fc.string({ minLength: 1, maxLength: 50 }), // Invalid email format
              fc.integer() // Wrong type
            ),
            age: fc.oneof(
              fc.integer({ min: -100, max: 0 }), // Invalid range
              fc.string(), // Wrong type
              fc.float() // Should be integer
            ),
          }),
          (invalidData) => {
            const schema = Joi.object({
              name: Joi.string().min(1).max(100).required(),
              email: Joi.string().email().required(),
              age: Joi.number().integer().min(1).max(120).required(),
            });

            const req = { body: invalidData };
            const res = {};
            let nextCalled = false;
            let nextError = null;

            const next = (error) => {
              nextCalled = true;
              nextError = error;
            };

            const middleware = ValidationMiddleware.validateBody(schema);
            middleware(req, res, next);

            // For invalid data, next should be called with validation error
            expect(nextCalled).to.be.true;
            expect(nextError).to.not.be.null;
            expect(nextError.name).to.equal("ValidationError");
            expect(nextError.status).to.equal(400);
            expect(nextError.details).to.be.an("array");
            expect(nextError.details.length).to.be.greaterThan(0);

            // Each error detail should have required fields
            nextError.details.forEach((detail) => {
              expect(detail).to.have.property("field");
              expect(detail).to.have.property("message");
              expect(detail.field).to.be.a("string");
              expect(detail.message).to.be.a("string");
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should validate request parameters with proper error handling", function () {
      return fc.assert(
        fc.property(fc.constant("validId123"), (validId) => {
          const schema = Joi.object({
            id: Joi.string().required(),
          });

          const req = { params: { id: validId } };
          const res = {};
          let nextCalled = false;
          let nextError = null;

          const next = (error) => {
            nextCalled = true;
            nextError = error;
          };

          const middleware = ValidationMiddleware.validateParams(schema);
          middleware(req, res, next);

          expect(nextCalled).to.be.true;
          expect(nextError).to.be.undefined;
          expect(req.params.id).to.equal(validId);
        }),
        { numRuns: 100 }
      );
    });

    it("should validate query parameters with pagination support", function () {
      return fc.assert(
        fc.property(
          fc.record({
            page: fc.integer({ min: 1, max: 1000 }),
            limit: fc.integer({ min: 1, max: 100 }),
            sort: fc.constantFrom("asc", "desc"),
            brand: fc.constant("ValidBrand"),
          }),
          (validQuery) => {
            const schema = Joi.object({
              page: Joi.number().integer().min(1).default(1),
              limit: Joi.number().integer().min(1).max(100).default(10),
              sort: Joi.string().valid("asc", "desc").default("asc"),
              brand: Joi.string().max(100).optional(),
            });

            const req = { query: validQuery };
            const res = {};
            let nextCalled = false;
            let nextError = null;

            const next = (error) => {
              nextCalled = true;
              nextError = error;
            };

            const middleware = ValidationMiddleware.validateQuery(schema);
            middleware(req, res, next);

            expect(nextCalled).to.be.true;
            expect(nextError).to.be.undefined;
            expect(req.query).to.deep.include(validQuery);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Schema validation across different entities", function () {
    it("should validate user registration data consistently", function () {
      return fc.assert(
        fc.property(
          fc.record({
            email: fc.emailAddress(),
            password: fc.constant("ValidPass123!"),
            nickname: fc.constant("validnick"),
            firstName: fc.constant("John"),
            lastName: fc.constant("Doe"),
          }),
          (userData) => {
            const { error, value } = UserSchemas.register.validate(userData);

            expect(error).to.be.undefined;
            expect(value).to.be.an("object");
            expect(value.email).to.equal(userData.email);
            expect(value.nickname).to.equal(userData.nickname);
            expect(value.firstName).to.equal(userData.firstName);
            expect(value.lastName).to.equal(userData.lastName);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should validate category data with proper name constraints", function () {
      return fc.assert(
        fc.property(fc.constant("Electronics"), (categoryName) => {
          const categoryData = { name: categoryName };
          const { error, value } =
            CategorySchemas.create.validate(categoryData);

          expect(error).to.be.undefined;
          expect(value).to.be.an("object");
          expect(value.name).to.equal(categoryName);
        }),
        { numRuns: 100 }
      );
    });

    it("should validate product data with price and stock constraints", function () {
      return fc.assert(
        fc.property(
          fc.record({
            name: fc.constant("Valid Product Name"),
            price: fc
              .float({ min: 1.0, max: 1000.0, noNaN: true })
              .map((n) => Math.round(n * 100) / 100),
            brand: fc.constant("ValidBrand"),
            stock: fc.integer({ min: 0, max: 10000 }),
            categoryIds: fc.constant(["category1", "category2"]),
          }),
          (productData) => {
            const { error, value } =
              ProductSchemas.create.validate(productData);

            expect(error).to.be.undefined;
            expect(value).to.be.an("object");
            expect(value.name).to.equal(productData.name);
            expect(value.price).to.equal(productData.price);
            expect(value.brand).to.equal(productData.brand);
            expect(value.stock).to.equal(productData.stock);
            expect(value.categoryIds).to.deep.equal(productData.categoryIds);
            expect(value.status).to.be.true; // Default value
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Error message consistency and structure", function () {
    it("should provide consistent error message structure for all validation failures", function () {
      return fc.assert(
        fc.property(
          fc.record({
            invalidField: fc.oneof(
              fc.constant(null),
              fc.constant(undefined),
              fc.string({ maxLength: 0 }), // Empty string
              fc.integer({ min: -1000, max: -1 }), // Negative number where positive expected
              fc.array(fc.anything(), { maxLength: 0 }) // Empty array where non-empty expected
            ),
          }),
          (invalidData) => {
            // Test with a schema that requires specific validation
            const schema = Joi.object({
              invalidField: Joi.string().min(1).required(),
            });

            const req = { body: invalidData };
            const res = {};
            let validationError = null;

            const next = (error) => {
              validationError = error;
            };

            const middleware = ValidationMiddleware.validateBody(schema);
            middleware(req, res, next);

            if (validationError) {
              // Verify error structure consistency
              expect(validationError.name).to.equal("ValidationError");
              expect(validationError.status).to.equal(400);
              expect(validationError.details).to.be.an("array");

              validationError.details.forEach((detail) => {
                expect(detail).to.have.all.keys(["field", "message", "value"]);
                expect(detail.field).to.be.a("string");
                expect(detail.message).to.be.a("string");
                expect(detail.message.length).to.be.greaterThan(0);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Comprehensive validation middleware", function () {
    it("should validate multiple request parts simultaneously", function () {
      return fc.assert(
        fc.property(
          fc.record({
            id: fc.constant("validId123"),
            name: fc.constant("ValidName"),
            page: fc.integer({ min: 1, max: 100 }),
          }),
          (testData) => {
            const schemas = {
              params: Joi.object({
                id: Joi.string().required(),
              }),
              body: Joi.object({
                name: Joi.string().required(),
              }),
              query: Joi.object({
                page: Joi.number().integer().min(1).default(1),
              }),
            };

            const req = {
              params: { id: testData.id },
              body: { name: testData.name },
              query: { page: testData.page },
            };
            const res = {};
            let nextCalled = false;
            let nextError = null;

            const next = (error) => {
              nextCalled = true;
              nextError = error;
            };

            const middleware = ValidationMiddleware.validate(schemas);
            middleware(req, res, next);

            expect(nextCalled).to.be.true;
            expect(nextError).to.be.undefined;
            expect(req.params.id).to.equal(testData.id);
            expect(req.body.name).to.equal(testData.name);
            expect(req.query.page).to.equal(testData.page);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Validation middleware integration with actual schemas", function () {
    it("should properly validate using CommonSchemas patterns", function () {
      return fc.assert(
        fc.property(
          fc.record({
            email: fc.emailAddress(),
            name: fc.constant("ValidName"),
          }),
          (testData) => {
            const schema = Joi.object({
              email: CommonSchemas.email,
              name: Joi.string().min(1).max(100).required(),
            });

            const req = { body: testData };
            const res = {};
            let nextCalled = false;
            let nextError = null;

            const next = (error) => {
              nextCalled = true;
              nextError = error;
            };

            const middleware = ValidationMiddleware.validateBody(schema);
            middleware(req, res, next);

            // Should pass validation
            expect(nextCalled).to.be.true;
            expect(nextError).to.be.undefined;
            expect(req.body.email).to.equal(testData.email);
            expect(req.body.name).to.equal(testData.name);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle validation errors with proper error structure", function () {
      return fc.assert(
        fc.property(
          fc.oneof(
            fc.record({ email: fc.constant("invalid-email") }),
            fc.record({ email: fc.constant("") }),
            fc.record({ name: fc.constant("") })
          ),
          (invalidData) => {
            const schema = Joi.object({
              email: CommonSchemas.email,
              name: Joi.string().min(1).max(100).required(),
            });

            const req = { body: invalidData };
            const res = {};
            let nextCalled = false;
            let nextError = null;

            const next = (error) => {
              nextCalled = true;
              nextError = error;
            };

            const middleware = ValidationMiddleware.validateBody(schema);
            middleware(req, res, next);

            // Should fail validation
            expect(nextCalled).to.be.true;
            expect(nextError).to.not.be.null;
            expect(nextError.name).to.equal("ValidationError");
            expect(nextError.status).to.equal(400);
            expect(nextError.details).to.be.an("array");
            expect(nextError.details.length).to.be.greaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

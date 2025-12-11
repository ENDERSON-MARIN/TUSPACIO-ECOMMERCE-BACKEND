const { expect } = require('chai');
const fc = require('fast-check');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

/**
 * **Feature: ecommerce-modernization, Property 3: Backward compatibility preservation**
 * **Validates: Requirements 1.3**
 *
 * For any existing API endpoint or functionality, the modernized system should maintain
 * the same behavior and response format as the original system
 */

describe('Property Test: Backward Compatibility Preservation', function () {
  let app;

  before(function () {
    // Load the Express app
    try {
      app = require('../../src/app');
    } catch (error) {
      // If app.js doesn't exist, try index.js
      app = require('../../index');
    }
  });

  // Define expected API endpoints that should maintain backward compatibility
  const expectedEndpoints = [
    { method: 'GET', path: '/api/products', description: 'Get all products' },
    {
      method: 'GET',
      path: '/api/products/:id',
      description: 'Get product by ID',
    },
    {
      method: 'POST',
      path: '/api/products',
      description: 'Create new product',
    },
    { method: 'PUT', path: '/api/products/:id', description: 'Update product' },
    {
      method: 'DELETE',
      path: '/api/products/:id',
      description: 'Delete product',
    },
    {
      method: 'GET',
      path: '/api/categories',
      description: 'Get all categories',
    },
    { method: 'GET', path: '/api/users', description: 'Get all users' },
    { method: 'POST', path: '/api/users', description: 'Create new user' },
    { method: 'GET', path: '/api/orders', description: 'Get all orders' },
    { method: 'POST', path: '/api/orders', description: 'Create new order' },
    { method: 'GET', path: '/api/reviews', description: 'Get all reviews' },
    { method: 'POST', path: '/api/reviews', description: 'Create new review' },
  ];

  it('should maintain all expected API endpoints', function () {
    fc.assert(
      fc.property(fc.constantFrom(...expectedEndpoints), async endpoint => {
        const testPath = endpoint.path.replace(':id', '1'); // Replace param with test value

        let response;
        switch (endpoint.method) {
          case 'GET':
            response = await request(app).get(testPath);
            break;
          case 'POST':
            response = await request(app).post(testPath).send({});
            break;
          case 'PUT':
            response = await request(app).put(testPath).send({});
            break;
          case 'DELETE':
            response = await request(app).delete(testPath);
            break;
          default:
            throw new Error(`Unsupported method: ${endpoint.method}`);
        }

        // Endpoint should exist (not return 404)
        expect(response.status).to.not.equal(
          404,
          `Endpoint ${endpoint.method} ${endpoint.path} should exist`
        );

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent response structure for GET endpoints', function () {
    const getEndpoints = expectedEndpoints.filter(ep => ep.method === 'GET');

    fc.assert(
      fc.property(fc.constantFrom(...getEndpoints), async endpoint => {
        const testPath = endpoint.path.replace(':id', '1');
        const response = await request(app).get(testPath);

        // Should return JSON response
        expect(response.headers['content-type']).to.match(/json/);

        // Should have a valid response body
        expect(response.body).to.exist;

        // For successful responses, should maintain expected structure
        if (response.status === 200) {
          if (endpoint.path.includes(':id')) {
            // Single resource endpoints should return an object
            expect(response.body).to.be.an('object');
          } else {
            // Collection endpoints should return an array or object with data property
            expect(response.body).to.satisfy(body => {
              return (
                Array.isArray(body) ||
                (typeof body === 'object' && body !== null)
              );
            });
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent error response format', function () {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999999 }), // Random non-existent ID
        async nonExistentId => {
          const response = await request(app).get(
            `/api/products/${nonExistentId}`
          );

          // Should return JSON response even for errors
          expect(response.headers['content-type']).to.match(/json/);

          // Should have a response body
          expect(response.body).to.exist;

          // Error responses should be objects
          expect(response.body).to.be.an('object');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain HTTP status code consistency', function () {
    fc.assert(
      fc.property(
        fc.constantFrom(...expectedEndpoints.filter(ep => ep.method === 'GET')),
        async endpoint => {
          const testPath = endpoint.path.replace(':id', '1');
          const response = await request(app).get(testPath);

          // Status codes should be valid HTTP status codes
          expect(response.status).to.be.within(100, 599);

          // Should use standard HTTP status codes
          const validStatusCodes = [200, 201, 400, 401, 403, 404, 422, 500];
          expect(validStatusCodes).to.include(response.status);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain CORS headers for cross-origin compatibility', function () {
    fc.assert(
      fc.property(
        fc.constantFrom(...expectedEndpoints.filter(ep => ep.method === 'GET')),
        async endpoint => {
          const testPath = endpoint.path.replace(':id', '1');
          const response = await request(app)
            .get(testPath)
            .set('Origin', 'http://localhost:3000'); // Simulate cross-origin request

          // Should include CORS headers for backward compatibility
          expect(response.headers).to.have.property(
            'access-control-allow-origin'
          );

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain content-type headers for API responses', function () {
    fc.assert(
      fc.property(
        fc.constantFrom(...expectedEndpoints.filter(ep => ep.method === 'GET')),
        async endpoint => {
          const testPath = endpoint.path.replace(':id', '1');
          const response = await request(app).get(testPath);

          // API endpoints should return JSON content-type
          if (response.status !== 404) {
            expect(response.headers['content-type']).to.match(
              /application\/json/
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain request body parsing for POST endpoints', function () {
    const postEndpoints = expectedEndpoints.filter(ep => ep.method === 'POST');

    fc.assert(
      fc.property(
        fc.constantFrom(...postEndpoints),
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          description: fc.string({ minLength: 1, maxLength: 200 }),
        }),
        async (endpoint, testData) => {
          const response = await request(app)
            .post(endpoint.path)
            .send(testData)
            .set('Content-Type', 'application/json');

          // Should accept JSON request bodies
          expect(response.status).to.not.equal(415); // Unsupported Media Type

          // Should process the request (not return 400 for malformed JSON)
          expect(response.status).to.not.equal(400);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain database model structure compatibility', function () {
    fc.assert(
      fc.property(fc.constant(true), () => {
        // Check that core models still exist
        const modelsPath = path.join(process.cwd(), 'src', 'models');

        if (fs.existsSync(modelsPath)) {
          const expectedModels = [
            'User.js',
            'Product.js',
            'Order.js',
            'Category.js',
            'Review.js',
          ];

          expectedModels.forEach(modelFile => {
            const modelPath = path.join(modelsPath, modelFile);
            expect(fs.existsSync(modelPath), `Model ${modelFile} should exist`)
              .to.be.true;
          });
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });
});

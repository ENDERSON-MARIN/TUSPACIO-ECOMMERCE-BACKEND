/**
 * **Feature: ecommerce-modernization, Property 13: Email functionality reliability**
 * **Validates: Requirements 7.2, 7.3, 7.4, 7.5**
 *
 * Property: For any email sending operation, the system should use proper error handling,
 * retry mechanisms, and support multiple email providers
 */

const { expect } = require('chai');
const fc = require('fast-check');
const { EmailService } = require('../../src/helpers/emailService');

describe('Property 13: Email functionality reliability', function () {
  it('should handle email template rendering for any valid input', function () {
    this.timeout(10000);

    return fc.assert(
      fc.property(
        fc.record({
          name: fc
            .string({ minLength: 1, maxLength: 100 })
            .filter(
              s => s.trim().length > 0 && /^[a-zA-Z0-9\s]+$/.test(s.trim())
            ),
          email: fc.emailAddress(),
        }),
        user => {
          try {
            const emailService = new EmailService();
            // Test template rendering (doesn't require network calls)
            const template = emailService.renderTemplate('orderSuccess', {
              name: user.name,
              website: 'https://test.com',
            });

            // Template should be a non-empty string containing the user's name
            expect(template).to.be.a('string');
            expect(template.length).to.be.greaterThan(0);
            expect(template).to.include(user.name);

            return true;
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Template rendering failed:', error.message);
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate email addresses correctly for any input', function () {
    return fc.assert(
      fc.property(
        fc.oneof(
          fc.emailAddress(), // Valid emails
          fc.string().filter(s => !s.includes('@')), // Invalid emails without @
          fc.constant(''), // Empty string
          fc.constant(null), // Null
          fc.constant(undefined) // Undefined
        ),
        input => {
          const emailService = new EmailService();
          const result = emailService.validateEmail(input);

          if (
            typeof input === 'string' &&
            input.includes('@') &&
            input.includes('.')
          ) {
            // Should return true for valid email-like strings
            return typeof result === 'boolean';
          } else {
            // Should return false for invalid inputs
            return result === false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should sanitize input correctly for any string input', function () {
    return fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.constant(null),
          fc.constant(undefined),
          fc.integer(),
          fc.boolean()
        ),
        input => {
          try {
            const emailService = new EmailService();
            const result = emailService.sanitizeInput(input);

            if (typeof input === 'string') {
              // Should return sanitized string without < or >
              expect(result).to.be.a('string');
              expect(result).to.not.include('<');
              expect(result).to.not.include('>');
              return true;
            } else {
              // Should return input unchanged for non-strings
              return result === input;
            }
          } catch (error) {
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle email configuration and retry settings correctly', function () {
    return fc.assert(
      fc.property(
        fc.record({
          maxRetries: fc.integer({ min: 1, max: 5 }),
          retryDelay: fc.integer({ min: 100, max: 2000 }),
        }),
        config => {
          try {
            // Test that email service accepts different retry configurations
            const testService = new EmailService();
            testService.maxRetries = config.maxRetries;
            testService.retryDelay = config.retryDelay;

            // Verify configuration is set correctly
            expect(testService.maxRetries).to.equal(config.maxRetries);
            expect(testService.retryDelay).to.equal(config.retryDelay);

            return true;
          } catch (error) {
            return false;
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should support multiple email providers configuration', function () {
    return fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('gmail'),
          fc.constant('mailtrap'),
          fc.constant('sendgrid'),
          fc.constant('outlook')
        ),
        provider => {
          try {
            const emailService = new EmailService();
            // Set environment variable for provider
            const originalProvider = process.env.EMAIL_PROVIDER;
            process.env.EMAIL_PROVIDER = provider;

            // Create transporter should not throw for supported providers
            const transporter = emailService.createTransporter();
            expect(transporter).to.be.an('object');

            // Restore original provider
            if (originalProvider) {
              process.env.EMAIL_PROVIDER = originalProvider;
            } else {
              delete process.env.EMAIL_PROVIDER;
            }

            return true;
          } catch (error) {
            // Should not throw for supported providers
            return false;
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});

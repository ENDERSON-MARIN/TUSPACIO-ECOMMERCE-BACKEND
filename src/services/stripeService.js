const { stripe, stripeConfig } = require('../config/stripe');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Stripe Service Module
 * Handles all Stripe operations with proper error handling, retry logic, and PCI compliance
 */

class StripeService {
  /**
   * Create a Stripe customer
   * @param {Object} customerData - Customer information
   * @returns {Promise<Object>} Stripe customer object
   */
  static async createCustomer(customerData) {
    try {
      const { id, email, name, metadata = {} } = customerData;

      // PCI Compliance: Only store necessary data, never store payment info
      const customer = await this.retryOperation(() =>
        stripe.customers.create({
          email,
          name,
          metadata: {
            user_id: id,
            ...metadata,
          },
        })
      );

      logger.info('Stripe customer created', {
        customerId: customer.id,
        userId: id,
      });

      return customer;
    } catch (error) {
      logger.error('Failed to create Stripe customer', {
        error: error.message,
        userId: customerData.id,
      });
      throw this.handleStripeError(error, 'Failed to create customer');
    }
  }

  /**
   * Create a checkout session
   * @param {Object} sessionData - Checkout session configuration
   * @returns {Promise<Object>} Stripe checkout session
   */
  static async createCheckoutSession(sessionData) {
    try {
      const {
        customerId,
        lineItems,
        successUrl,
        cancelUrl,
        mode = 'payment',
        currency = 'usd',
        shippingOptions = [],
        metadata = {},
      } = sessionData;

      // Validate line items for PCI compliance
      this.validateLineItems(lineItems);

      const session = await this.retryOperation(() =>
        stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: lineItems,
          mode,
          currency,
          success_url: successUrl,
          cancel_url: cancelUrl,
          shipping_address_collection: {
            allowed_countries: [
              'US',
              'CA',
              'MX',
              'AR',
              'BR',
              'CL',
              'CO',
              'PE',
              'UY',
              'VE',
            ],
          },
          shipping_options: shippingOptions,
          metadata,
          // PCI Compliance: Enable automatic tax calculation if available
          automatic_tax: { enabled: false },
          // Security: Set session expiration
          expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        })
      );

      logger.info('Checkout session created', {
        sessionId: session.id,
        customerId,
      });

      return session;
    } catch (error) {
      logger.error('Failed to create checkout session', {
        error: error.message,
        customerId: sessionData.customerId,
      });
      throw this.handleStripeError(error, 'Failed to create checkout session');
    }
  }

  /**
   * Retrieve a customer with retry logic
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Object>} Stripe customer object
   */
  static async retrieveCustomer(customerId) {
    try {
      const customer = await this.retryOperation(() =>
        stripe.customers.retrieve(customerId)
      );

      return customer;
    } catch (error) {
      logger.error('Failed to retrieve customer', {
        error: error.message,
        customerId,
      });
      throw this.handleStripeError(error, 'Failed to retrieve customer');
    }
  }

  /**
   * List line items for a checkout session
   * @param {string} sessionId - Checkout session ID
   * @returns {Promise<Object>} Line items
   */
  static async listSessionLineItems(sessionId) {
    try {
      const lineItems = await this.retryOperation(() =>
        stripe.checkout.sessions.listLineItems(sessionId)
      );

      return lineItems;
    } catch (error) {
      logger.error('Failed to list session line items', {
        error: error.message,
        sessionId,
      });
      throw this.handleStripeError(error, 'Failed to retrieve session items');
    }
  }

  /**
   * Verify webhook signature for security
   * @param {string} payload - Raw webhook payload
   * @param {string} signature - Stripe signature header
   * @param {string} secret - Webhook secret
   * @returns {Object} Verified webhook event
   */
  static verifyWebhookSignature(payload, signature, secret) {
    try {
      if (!secret) {
        throw new Error('Webhook secret not configured');
      }

      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        secret,
        stripeConfig.webhook.tolerance
      );

      logger.info('Webhook signature verified', {
        eventType: event.type,
        eventId: event.id,
      });

      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed', {
        error: error.message,
      });
      throw new AppError(
        'Invalid webhook signature',
        400,
        'WEBHOOK_SIGNATURE_INVALID'
      );
    }
  }

  /**
   * Process webhook events with proper error handling
   * @param {Object} event - Stripe webhook event
   * @returns {Promise<Object>} Processing result
   */
  static async processWebhookEvent(event) {
    try {
      const { type, data } = event;

      logger.info('Processing webhook event', {
        eventType: type,
        eventId: event.id,
      });

      switch (type) {
        case 'checkout.session.completed':
          return await this.handleCheckoutSessionCompleted(data.object);

        case 'payment_intent.succeeded':
          return await this.handlePaymentIntentSucceeded(data.object);

        case 'payment_intent.payment_failed':
          return await this.handlePaymentIntentFailed(data.object);

        case 'customer.created':
          return await this.handleCustomerCreated(data.object);

        default:
          logger.info('Unhandled webhook event type', { eventType: type });
          return { processed: false, reason: 'Unhandled event type' };
      }
    } catch (error) {
      logger.error('Webhook event processing failed', {
        error: error.message,
        eventType: event.type,
        eventId: event.id,
      });
      throw error;
    }
  }

  /**
   * Handle checkout session completed event
   * @param {Object} session - Checkout session object
   * @returns {Promise<Object>} Processing result
   */
  static async handleCheckoutSessionCompleted(session) {
    try {
      const customer = await this.retrieveCustomer(session.customer);
      const lineItems = await this.listSessionLineItems(session.id);

      return {
        processed: true,
        customer,
        session,
        lineItems,
        customerDetails: session.customer_details,
      };
    } catch (error) {
      logger.error('Failed to handle checkout session completed', {
        error: error.message,
        sessionId: session.id,
      });
      throw error;
    }
  }

  /**
   * Handle payment intent succeeded event
   * @param {Object} paymentIntent - Payment intent object
   * @returns {Promise<Object>} Processing result
   */
  static async handlePaymentIntentSucceeded(paymentIntent) {
    logger.info('Payment succeeded', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    return {
      processed: true,
      paymentIntent,
      status: 'succeeded',
    };
  }

  /**
   * Handle payment intent failed event
   * @param {Object} paymentIntent - Payment intent object
   * @returns {Promise<Object>} Processing result
   */
  static async handlePaymentIntentFailed(paymentIntent) {
    logger.error('Payment failed', {
      paymentIntentId: paymentIntent.id,
      lastPaymentError: paymentIntent.last_payment_error,
    });

    return {
      processed: true,
      paymentIntent,
      status: 'failed',
      error: paymentIntent.last_payment_error,
    };
  }

  /**
   * Handle customer created event
   * @param {Object} customer - Customer object
   * @returns {Promise<Object>} Processing result
   */
  static async handleCustomerCreated(customer) {
    logger.info('Customer created via webhook', {
      customerId: customer.id,
      email: customer.email,
    });

    return {
      processed: true,
      customer,
    };
  }

  /**
   * Retry operation with exponential backoff
   * @param {Function} operation - Operation to retry
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<any>} Operation result
   */
  static async retryOperation(
    operation,
    maxRetries = stripeConfig.retryConfig.maxRetries
  ) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on certain error types
        if (this.shouldNotRetry(error)) {
          throw error;
        }

        if (attempt < maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          logger.warn(`Stripe operation failed, retrying in ${delay}ms`, {
            attempt: attempt + 1,
            maxRetries: maxRetries + 1,
            error: error.message,
          });
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param {number} attempt - Current attempt number
   * @returns {number} Delay in milliseconds
   */
  static calculateRetryDelay(attempt) {
    const baseDelay = stripeConfig.retryConfig.retryDelayMs;

    if (stripeConfig.retryConfig.exponentialBackoff) {
      return baseDelay * Math.pow(2, attempt);
    }

    return baseDelay;
  }

  /**
   * Check if error should not be retried
   * @param {Error} error - Error to check
   * @returns {boolean} True if should not retry
   */
  static shouldNotRetry(error) {
    const nonRetryableTypes = [
      'StripeCardError',
      'StripeInvalidRequestError',
      'StripeAuthenticationError',
    ];

    return nonRetryableTypes.includes(error.type);
  }

  /**
   * Validate line items for PCI compliance
   * @param {Array} lineItems - Line items to validate
   */
  static validateLineItems(lineItems) {
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      throw new AppError('Line items are required', 400, 'INVALID_LINE_ITEMS');
    }

    lineItems.forEach((item, index) => {
      if (!item.price_data || !item.quantity) {
        throw new AppError(
          `Invalid line item at index ${index}`,
          400,
          'INVALID_LINE_ITEM'
        );
      }

      if (item.quantity <= 0) {
        throw new AppError(
          `Invalid quantity for line item at index ${index}`,
          400,
          'INVALID_QUANTITY'
        );
      }
    });
  }

  /**
   * Handle Stripe errors with proper categorization
   * @param {Error} error - Stripe error
   * @param {string} context - Error context
   * @returns {AppError} Formatted application error
   */
  static handleStripeError(error, context = 'Stripe operation failed') {
    let message = context;
    let statusCode = 500;
    let code = 'STRIPE_ERROR';

    switch (error.type) {
      case 'StripeCardError':
        message = `Card error: ${error.message}`;
        statusCode = 400;
        code = 'CARD_ERROR';
        break;
      case 'StripeRateLimitError':
        message = 'Too many requests to payment processor';
        statusCode = 429;
        code = 'PAYMENT_RATE_LIMIT';
        break;
      case 'StripeInvalidRequestError':
        message = `Invalid request: ${error.message}`;
        statusCode = 400;
        code = 'INVALID_PAYMENT_REQUEST';
        break;
      case 'StripeAPIError':
        message = 'Payment service temporarily unavailable';
        statusCode = 502;
        code = 'PAYMENT_SERVICE_ERROR';
        break;
      case 'StripeConnectionError':
        message = 'Payment service connection failed';
        statusCode = 503;
        code = 'PAYMENT_CONNECTION_ERROR';
        break;
      case 'StripeAuthenticationError':
        message = 'Payment authentication failed';
        statusCode = 401;
        code = 'PAYMENT_AUTH_ERROR';
        break;
      default:
        message = error.message || context;
        break;
    }

    return new AppError(message, statusCode, code, {
      stripeErrorType: error.type,
      stripeErrorCode: error.code,
    });
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = StripeService;

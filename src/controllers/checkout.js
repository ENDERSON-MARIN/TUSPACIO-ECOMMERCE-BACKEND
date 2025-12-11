const { updateOrder } = require('./orders');
const sendEmailUsers = require('../helpers/sendEmailUsers');
const StripeService = require('../services/stripeService');
const { stripeConfig } = require('../config/stripe');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const CLIENT =
  process.env.CLIENT_URL ||
  'https://tuspacio.vercel.app' ||
  'http://localhost:3000';

/**
 * Create Stripe checkout session
 * Enhanced with proper error handling, validation, and PCI compliance
 */
const Checkout = catchAsync(async (req, res) => {
  const { id, cartProducts, email, name } = req.body;

  // Validate request data
  if (
    !id ||
    !cartProducts ||
    !Array.isArray(cartProducts) ||
    cartProducts.length === 0
  ) {
    throw new AppError(
      'Invalid checkout data: user ID and cart products are required',
      400,
      'INVALID_CHECKOUT_DATA'
    );
  }

  // PCI Compliance: Log checkout attempt without sensitive data
  logger.info('Checkout initiated', {
    userId: id,
    itemCount: cartProducts.length,
    testMode: stripeConfig.isTestMode,
  });

  try {
    // Create Stripe customer
    const customer = await StripeService.createCustomer({
      id,
      email,
      name,
      metadata: {
        checkout_initiated_at: new Date().toISOString(),
      },
    });

    // Prepare line items with validation
    const lineItems = cartProducts.map((item, index) => {
      if (!item.name || !item.price || !item.quantity) {
        throw new AppError(
          `Invalid product data at index ${index}`,
          400,
          'INVALID_PRODUCT_DATA'
        );
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image_link ? [item.image_link] : [],
            description: item.description || '',
            metadata: {
              product_id: item.id?.toString() || '',
              brand: item.brand || '',
            },
          },
          unit_amount: Math.round(item.price * 100), // Ensure integer cents
        },
        quantity: parseInt(item.quantity, 10),
      };
    });

    // Define shipping options
    const shippingOptions = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 0,
            currency: 'usd',
          },
          display_name: 'Free shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 5,
            },
            maximum: {
              unit: 'business_day',
              value: 7,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 2500,
            currency: 'usd',
          },
          display_name: 'Fast shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 1,
            },
            maximum: {
              unit: 'business_day',
              value: 3,
            },
          },
        },
      },
    ];

    // Create checkout session
    const session = await StripeService.createCheckoutSession({
      customerId: customer.id,
      lineItems,
      successUrl: `${CLIENT}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${CLIENT}/cart`,
      shippingOptions,
      metadata: {
        user_id: id.toString(),
        checkout_timestamp: new Date().toISOString(),
      },
    });

    // PCI Compliance: Only return necessary data
    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
      testMode: stripeConfig.isTestMode,
    });
  } catch (error) {
    logger.error('Checkout failed', {
      userId: id,
      error: error.message,
      errorType: error.constructor.name,
    });
    throw error;
  }
});

/**
 * Handle Stripe webhooks with proper signature verification
 * Enhanced with comprehensive error handling and event processing
 */
const webhook = catchAsync(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = stripeConfig.webhook.secret;

  // PCI Compliance: Log webhook attempt without sensitive data
  logger.info('Webhook received', {
    hasSignature: !!signature,
    hasSecret: !!webhookSecret,
    testMode: stripeConfig.isTestMode,
  });

  try {
    let event;

    // Verify webhook signature for security
    if (webhookSecret && signature) {
      event = StripeService.verifyWebhookSignature(
        req.body,
        signature,
        webhookSecret
      );
    } else {
      // Fallback for development (not recommended for production)
      if (process.env.NODE_ENV === 'production') {
        throw new AppError(
          'Webhook signature verification required in production',
          400,
          'WEBHOOK_SIGNATURE_REQUIRED'
        );
      }

      logger.warn(
        'Webhook processed without signature verification (development only)'
      );
      event = req.body;
    }

    // Process the webhook event
    const result = await StripeService.processWebhookEvent(event);

    // Handle specific event types
    if (event.type === 'checkout.session.completed' && result.processed) {
      try {
        // Update order in database
        await updateOrder(result.customer, result.session, result.lineItems);

        // Send confirmation email
        if (result.customerDetails?.email) {
          const user = {
            name: result.customerDetails.name,
            email: result.customerDetails.email,
          };
          await sendEmailUsers.sendMail(user);
          logger.info('Checkout confirmation email sent', {
            email: result.customerDetails.email,
            sessionId: result.session.id,
          });
        }
      } catch (error) {
        logger.error('Post-webhook processing failed', {
          error: error.message,
          sessionId: result.session?.id,
        });
        // Don't throw here - webhook was processed successfully
        // The error is in our post-processing, not Stripe's webhook
      }
    }

    // Return success response to Stripe
    res.status(200).json({
      received: true,
      processed: result.processed,
      eventType: event.type,
    });
  } catch (error) {
    logger.error('Webhook processing failed', {
      error: error.message,
      errorType: error.constructor.name,
    });

    // Return appropriate error response
    if (error.code === 'WEBHOOK_SIGNATURE_INVALID') {
      res.status(400).json({ error: 'Invalid signature' });
    } else {
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
});

module.exports = {
  Checkout,
  webhook,
};

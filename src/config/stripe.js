const Stripe = require('stripe');

/**
 * Stripe Configuration Module
 * Handles Stripe SDK initialization with proper environment-based configuration
 */

// Validate required environment variables
const requiredEnvVars = ['STRIPE_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required Stripe environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Initialize Stripe with configuration
const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || '2024-11-20.acacia',
  typescript: false,
  telemetry: process.env.NODE_ENV === 'production',
  maxNetworkRetries: 3,
  timeout: 30000, // 30 seconds
});

/**
 * Stripe configuration object
 */
const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  apiVersion: process.env.STRIPE_API_VERSION || '2024-11-20.acacia',
  isTestMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'),

  // PCI Compliance settings
  pciCompliance: {
    // Never log sensitive payment data
    logSensitiveData: false,
    // Use HTTPS in production
    requireHttps: process.env.NODE_ENV === 'production',
    // Validate webhook signatures
    validateWebhooks: true,
  },

  // Retry configuration for failed operations
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 1000,
    exponentialBackoff: true,
  },

  // Webhook configuration
  webhook: {
    secret: process.env.STRIPE_WEBHOOK_SECRET,
    tolerance: 300, // 5 minutes tolerance for webhook timestamps
  },
};

/**
 * Validate Stripe configuration
 */
const validateStripeConfig = () => {
  const errors = [];

  if (!stripeConfig.secretKey) {
    errors.push('STRIPE_SECRET_KEY is required');
  }

  if (stripeConfig.secretKey && !stripeConfig.secretKey.startsWith('sk_')) {
    errors.push('STRIPE_SECRET_KEY must start with "sk_"');
  }

  if (process.env.NODE_ENV === 'production' && stripeConfig.isTestMode) {
    errors.push('Production environment should not use test keys');
  }

  if (process.env.NODE_ENV === 'development' && !stripeConfig.isTestMode) {
    console.warn('Warning: Using live Stripe keys in development environment');
  }

  if (errors.length > 0) {
    throw new Error(`Stripe configuration errors: ${errors.join(', ')}`);
  }

  return true;
};

// Validate configuration on module load
validateStripeConfig();

module.exports = {
  stripe,
  stripeConfig,
  validateStripeConfig,
};

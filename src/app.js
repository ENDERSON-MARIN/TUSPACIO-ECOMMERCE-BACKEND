const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const routes = require('./routes/index.js');
const cors = require('cors');
const logger = require('./utils/logger');
const {
  globalErrorHandler,
  handleNotFound,
} = require('./middleware/errorHandler');
require('dotenv').config();

// Enhanced Auth0 configuration (updated to latest version)
const { auth } = require('express-openid-connect');

const auth0Config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET || process.env.SECRET,
  baseURL: process.env.AUTH0_BASE_URL || process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID || process.env.CLIENT_ID,
  issuerBaseURL:
    process.env.AUTH0_ISSUER_BASE_URL || process.env.ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  idpLogout: true,
  session: {
    rollingDuration: 24 * 60 * 60, // 24 hours in seconds
    absoluteDuration: 7 * 24 * 60 * 60, // 7 days in seconds
  },
  routes: {
    login: '/auth/login',
    logout: '/auth/logout',
    callback: '/auth/callback',
  },
};

require('./db.js');

const server = express();
// server.use(auth(config));

server.name = 'API';

// Trust proxy for accurate client IP addresses
server.set('trust proxy', 1);

// Security middleware - applied first for maximum protection
server.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/health';
  },
});

server.use(limiter);

// CORS configuration optimized for production and development
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://pg-tuspacio.up.railway.app',
      'https://tuspacio.vercel.app',
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (
      allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))
    ) {
      return callback(null, true);
    }

    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
};

server.use(cors(corsOptions));

// Enhanced session configuration for security
const sessionConfig = {
  secret:
    process.env.SESSION_SECRET ||
    'your-super-secure-session-secret-key-minimum-32-characters',
  name: 'tuspacio.sid', // Custom session name
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // CSRF protection
  },
  rolling: true, // Reset expiration on activity
};

server.use(session(sessionConfig));

// Auth0 middleware (optional - can be enabled via environment variable)
if (process.env.ENABLE_AUTH0 === 'true' && auth0Config.clientID) {
  server.use(auth(auth0Config));
}

// Request parsing middleware - optimized ordering
server.use(
  express.json({
    limit: '10mb',
    type: ['application/json', 'text/plain'],
  })
);
server.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 1000,
  })
);

// Legacy body-parser for backward compatibility (if needed)
server.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
server.use(bodyParser.json({ limit: '10mb' }));

server.use(cookieParser());

// Enhanced logging middleware
server.use(logger.createMorganMiddleware());
server.use(logger.createTimingMiddleware());
server.use(logger.createMonitoringMiddleware());

// Performance monitoring middleware
const performanceMonitor = require('./utils/performanceMonitor');
server.use(performanceMonitor.createMiddleware());

// Caching middleware for static responses
const { cache } = require('./utils/cache');
server.use(
  '/api',
  cache.createMiddleware({
    ttl: 300000, // 5 minutes cache for API responses
    shouldCache: (req, res) => {
      // Only cache GET requests with successful responses
      return (
        req.method === 'GET' &&
        res.statusCode === 200 &&
        !req.originalUrl.includes('/health') &&
        !req.originalUrl.includes('/metrics')
      );
    },
  })
);

// Enhanced health check endpoint with comprehensive monitoring
server.get('/health', async (req, res) => {
  try {
    const healthStatus = await performanceMonitor.getHealthStatus();

    // Set appropriate status code based on health
    let statusCode = 200;
    if (healthStatus.status === 'DEGRADED') {
      statusCode = 200; // Still OK but with warnings
    } else if (healthStatus.status === 'UNHEALTHY') {
      statusCode = 503; // Service unavailable
    }

    res.status(statusCode).json(healthStatus);
  } catch (error) {
    performanceMonitor.recordError(error, 'health-check');
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error.message,
    });
  }
});

// Performance metrics endpoint
server.get('/metrics', (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    performanceMonitor.recordError(error, 'metrics-endpoint');
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      message: error.message,
    });
  }
});

// Cache statistics endpoint
server.get('/cache/stats', (req, res) => {
  try {
    const stats = cache.getStats();
    res.status(200).json(stats);
  } catch (error) {
    performanceMonitor.recordError(error, 'cache-stats-endpoint');
    res.status(500).json({
      error: 'Failed to retrieve cache statistics',
      message: error.message,
    });
  }
});

// Cache management endpoints (for development/debugging)
if (process.env.NODE_ENV !== 'production') {
  server.delete('/cache', (req, res) => {
    try {
      cache.clear();
      res.status(200).json({ message: 'Cache cleared successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  });

  // Load testing endpoint (development only)
  server.post('/load-test', async (req, res) => {
    try {
      const LoadTester = require('./utils/loadTester');
      const loadTester = new LoadTester({
        baseUrl: `http://localhost:${process.env.PORT || 3001}`,
      });

      const options = {
        concurrency: req.body.concurrency || 10,
        totalRequests: req.body.totalRequests || 50,
        path: req.body.path || '/health',
      };

      const results = await loadTester.runConcurrentTest(options);
      res.status(200).json(results);
    } catch (error) {
      performanceMonitor.recordError(error, 'load-test-endpoint');
      res.status(500).json({
        error: 'Load test failed',
        message: error.message,
      });
    }
  });
}

// Simple health check for load balancers (lightweight)
server.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// API routes
server.use('/api', routes);

// Handle unhandled routes (404)
server.use('*', handleNotFound);

// Global error handling middleware
server.use(globalErrorHandler);

module.exports = server;

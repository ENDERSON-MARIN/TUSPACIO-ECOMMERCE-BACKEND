const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const routes = require("./routes/index.js");
const cors = require("cors");
require("dotenv").config();
// const { auth } = require('express-openid-connect');

// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: process.env.SECRET,
//   baseURL: process.env.BASE_URL,
//   clientID: process.env.CLIENT_ID,
//   issuerBaseURL: process.env.ISSUER_BASE_URL
// };

require("./db.js");

const server = express();
// server.use(auth(config));

server.name = "API";

// Trust proxy for accurate client IP addresses
server.set("trust proxy", 1);

// Security middleware - applied first for maximum protection
server.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
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
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/health" || req.path === "/health";
  },
});

server.use(limiter);

// CORS configuration optimized for production and development
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://pg-tuspacio.up.railway.app",
      "https://tuspacio.vercel.app",
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (
      allowedOrigins.some((allowedOrigin) => origin.startsWith(allowedOrigin))
    ) {
      return callback(null, true);
    }

    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== "production" && origin.includes("localhost")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: ["X-Total-Count"],
  maxAge: 86400, // 24 hours
};

server.use(cors(corsOptions));

// Request parsing middleware - optimized ordering
server.use(
  express.json({
    limit: "10mb",
    type: ["application/json", "text/plain"],
  })
);
server.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
    parameterLimit: 1000,
  })
);

// Legacy body-parser for backward compatibility (if needed)
server.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
server.use(bodyParser.json({ limit: "10mb" }));

server.use(cookieParser());

// Logging middleware
server.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Health check endpoint
server.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API routes
server.use("/api", routes);

// 404 handler for undefined routes
server.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// Enhanced error handling middleware
server.use((err, req, res, next) => {
  // Log error details
  console.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      message: err.message,
      details: err.details || null,
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: "File Too Large",
      message: "File size exceeds the allowed limit",
    });
  }

  // CORS errors
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      error: "CORS Error",
      message: "Cross-origin request blocked",
    });
  }

  // Default error response
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Something went wrong";

  res.status(status).json({
    error: status >= 500 ? "Internal Server Error" : "Client Error",
    message: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

module.exports = server;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../db.js");

// JWT Configuration
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secure-jwt-secret-key-minimum-32-characters";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Salt rounds for bcrypt (minimum 12 for security)
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

/**
 * Generate JWT access token
 * @param {Object} payload - User payload
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: JWT_EXPIRES_IN,
    issuer: "tuspacio-api",
    audience: "tuspacio-client",
  });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - User payload
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: "tuspacio-api",
    audience: "tuspacio-client",
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ["HS256"],
    issuer: "tuspacio-api",
    audience: "tuspacio-client",
  });
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} Password match result
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * JWT Authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Access token is required",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Access token has expired",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid access token",
      });
    } else {
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Token verification failed",
      });
    }
  }
};

/**
 * Optional JWT Authentication middleware (doesn't fail if no token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Silently ignore token errors for optional auth
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

/**
 * Role-based authorization middleware
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

/**
 * Refresh token endpoint handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshTokenHandler = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Refresh token is required",
    });
  }

  try {
    const decoded = verifyToken(refreshToken);

    // Verify user still exists and is active
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.status) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found or inactive",
      });
    }

    // Generate new tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.rol_id,
      nickname: user.nickname,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: "Bearer",
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Refresh token has expired",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid refresh token",
      });
    } else {
      console.error("Refresh token error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Token refresh failed",
      });
    }
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authenticateToken,
  optionalAuth,
  authorizeRoles,
  refreshTokenHandler,
  JWT_SECRET,
  SALT_ROUNDS,
};

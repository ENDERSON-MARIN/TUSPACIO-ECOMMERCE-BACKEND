const router = require("express").Router();

const {
  getLogin,
  loginWithPassword,
  register,
} = require("../../controllers/authorization/login.js");

const { refreshTokenHandler } = require("../../middleware/auth.js");

// OAuth/Social login (existing endpoint)
router.post("/", getLogin);

// Traditional email/password login
router.post("/password", loginWithPassword);

// User registration
router.post("/register", register);

// Token refresh
router.post("/refresh", refreshTokenHandler);

module.exports = router;

const router = require("express").Router();
const {
  authenticateToken,
  optionalAuth,
  authorizeRoles,
} = require("../middleware/auth.js");

// Test protected route
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

// Test optional auth route
router.get("/public", optionalAuth, (req, res) => {
  res.json({
    message: "Public route with optional auth",
    user: req.user || "Anonymous",
  });
});

// Test admin-only route
router.get(
  "/admin",
  authenticateToken,
  authorizeRoles(["admin"]),
  (req, res) => {
    res.json({
      message: "Admin-only route accessed successfully",
      user: req.user,
    });
  }
);

module.exports = router;

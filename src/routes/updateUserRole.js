const { Router } = require("express");
const { updateUserRole } = require("../controllers/updateUserRole.js");
const router = Router();

router.patch("/:id",updateUserRole);

module.exports = router;

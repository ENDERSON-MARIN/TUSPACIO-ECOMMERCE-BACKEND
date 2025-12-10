const { Router } = require("express");
const { updateOrderStatus } = require("../controllers/updateOrderStatus.js");
const router = Router();

router.patch("/:id",updateOrderStatus);

module.exports = router;

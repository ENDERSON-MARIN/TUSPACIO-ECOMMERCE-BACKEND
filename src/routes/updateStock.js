const { Router } = require("express");


const { updateStockProduct } = require("../controllers/updateStock.js");
const router = Router();


/* UPDATE STOCK IN THE DATABASE */
router.put("/:id", updateStockProduct);


module.exports = router;
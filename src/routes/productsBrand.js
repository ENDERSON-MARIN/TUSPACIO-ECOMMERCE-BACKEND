const { Router } = require("express");


const {
    getProductsBrand,
} = require("../controllers/productsbrand.js");

const router = Router();

/* GET PRODUCTS BY BRAND */

router.get("/", getProductsBrand);

module.exports = router;

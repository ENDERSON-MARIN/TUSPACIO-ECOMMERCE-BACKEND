const { Router } = require("express");
const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({});

const {
    getProductName,
} = require("../controllers/productsname.js");

const router = Router();

/* GET DETAIL PRODUCT FRONT THE DATABASE */

router.get("/", getProductName);

module.exports = router;

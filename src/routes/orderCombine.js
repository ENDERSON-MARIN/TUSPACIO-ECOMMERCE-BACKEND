const { Router } = require("express");
const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({});

/* LINKS TO DOCS JOI AND EXPRESS-JOI-VALIDATION 
https://joi.dev/api/?v=17.6.0
https://github.com/evanshortiss/express-joi-validation#readme
*/

const {
    orderCombine,
} = require("../controllers/orderCombine.js");

const router = Router();

/* ORDERING BY PRICE  */

router.get("/", orderCombine);

module.exports = router;
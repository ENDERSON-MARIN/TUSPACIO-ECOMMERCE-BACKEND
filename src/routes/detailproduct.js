const { Router } = require("express");
const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({});

/* LINKS TO DOCS JOI AND EXPRESS-JOI-VALIDATION 
https://joi.dev/api/?v=17.6.0
https://github.com/evanshortiss/express-joi-validation#readme
*/

/* SE CREAN LOS OBJETOS CON LOS TIPOS DE VALIDACIONES */
const querySchema = Joi.object({
    name: Joi.string().regex(/^[a-zA-Z\s]+$/),
});

const paramsSchema = Joi.object({
    id: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
});

const bodySchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
});

const {
    getDetailProduct,
} = require("../controllers/detailproduct.js");

const router = Router();

/* GET DETAIL PRODUCT FRONT THE DATABASE */

router.get("/:id", validator.params(paramsSchema), getDetailProduct);

module.exports = router;

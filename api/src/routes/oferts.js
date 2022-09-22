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
//   startDate: Joi.date().min(3).max(100).required(),
//   endDate: Joi.date().min(3).max(100).required(),
  //status: Joi.srting().min(3).max(100).required(),
//   description: Joi.string().min(3).max(1500).required(),
//   discountPercent: Joi.number().min(1).precision(1).required(),
//   //products_id: Joi.array().items(Joi.string().regex(/^[a-zA-Z\s]+$/)),
  // status: Joi.boolean(),
  // stock: Joi.number().min(1).required(),
  // category_id: Joi.string().min(1).max(50).required(),
});

const { getDbOferts, createOfert} = require("../controllers/oferts.js");

const router = Router();

/* SE ARMAN LAS RUTAS PASANDO LAS VALIDACIONES COMO MIDDLEWARES */

/* GET ALL OFERTS FRONT THE DATABASE */
router.get("/", getDbOferts);

/* CREATE NEW OFERT IN THE DATABASE */

router.post("/:Product_id", createOfert);


module.exports = router;
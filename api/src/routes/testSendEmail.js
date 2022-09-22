const { Router } = require("express");
const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({});

/* LINKS TO DOCS JOI AND EXPRESS-JOI-VALIDATION 
https://joi.dev/api/?v=17.6.0
https://github.com/evanshortiss/express-joi-validation#readme
*/

/* SE CREAN LOS OBJETOS CON LOS TIPOS DE VALIDACIONES */
// const bodySchema = Joi.object({
//   name: Joi.string().regex(/^[a-zA-Z\s]+$/),
//   email: Joi.string().email(),
// });

const { sendEmail } = require("../helpers/allEmails");

const router = Router();

router.post("/", sendEmail);

module.exports = router;

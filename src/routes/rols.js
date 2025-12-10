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
    rolName: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
    status: Joi.boolean(),
});

const {
    getAllRols,
    createRol,
    updateRol,
    destroyRol,
} = require("../controllers/rols");

const router = Router();

/* SE ARMAN LAS RUTAS PASANDO LAS VALIDACIONES COMO MIDDLEWARES */

/* GET ALL ROLS FRONT THE DATABASE */
router.get("/", getAllRols);

/* CREATE NEW ROL IN THE DATABASE */
router.post("/", validator.body(bodySchema), createRol);

/* UPDATE ROL IN THE DATABASE */
router.put("/:id", 
validator.params(paramsSchema), 
validator.body(bodySchema),
updateRol);

/* DELETE ROL IN THE DATABASE */
router.delete("/:id", validator.params(paramsSchema), destroyRol);

module.exports = router;

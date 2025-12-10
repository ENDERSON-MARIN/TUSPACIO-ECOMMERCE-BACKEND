const { Router } = require("express");
const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({});


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
    getAllRoles,
    createRol,
    updateRol,
    deleteRol
} = require("../controllers/roles.js");

const router = Router();

/* GET ALL ROLES FRONT THE DATABASE */
router.get("/", getAllRoles);

/* CREATE NEW ROL IN THE DATABASE */
router.post("/", validator.params(querySchema), createRol);

/* UPDATE ROL IN THE DATABASE */
router.put("/:id", validator.params(paramsSchema), updateRol);

/* DELETE ROL IN THE DATABASE */
router.delete("/:id", validator.params(paramsSchema), deleteRol);

module.exports = router;

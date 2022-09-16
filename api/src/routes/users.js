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
  idUser: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
  idProduct: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
});

const bodySchema = Joi.object({
  nickname: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
  name: Joi.string().regex(/^[a-zA-Z\s]+$/),
  email: Joi.string().email(),
  email_verified: Joi.boolean(),
  sid: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
  picture: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
  status: Joi.boolean(),
  rol: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
});

const {
  getAllUsers,
  getOneUsers,
  createUser,
  updateUser,
  deleteUser,
  addFavorite,
  deleteFavorite,
  getAllFavorites
} = require("../controllers/users");
    
const router = Router();

/* SE ARMAN LAS RUTAS PASANDO LAS VALIDACIONES COMO MIDDLEWARES */

/* GET ALL USERS FRONT THE DATABASE */
router.get("/", getAllUsers);

/* GET ONE USER FRONT THE DATABASE */
router.get("/:id", getOneUsers);

/* CREATE NEW USER IN THE DATABASE */
router.post("/", createUser);

/* UPDATE USERS IN THE DATABASE */
router.put(
  "/:id",
  validator.params(paramsSchema),
  validator.body(bodySchema),
  updateUser
);

/* INSERT A FAVORITE USER OF A USER */
router.put(
  "/addFavorite/:idUser/:idProduct",
  validator.params(paramsSchema),
  validator.body(bodySchema),
  addFavorite
);

/* GET ALL FAVORITES OF A USER */
router.get("/favorites/:idUser", validator.params(paramsSchema),
  getAllFavorites
);

/* DELETE A FAVORITE PRODUCT OF A USER */
router.delete("/deleteFavorite/:idUser/:idProduct",
  validator.params(paramsSchema),
  validator.body(bodySchema),
  deleteFavorite
);



/* DELETE USER IN THE DATABASE */
router.delete("/:id", deleteUser);

module.exports = router;
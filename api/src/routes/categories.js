const { Router } = require("express");
const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({});

/* LINKS TO DOCS JOI AND EXPRESS-JOI-VALIDATION 
https://joi.dev/api/?v=17.6.0
https://github.com/evanshortiss/express-joi-validation#readme
*/

/* SE CREAN LOS OBJETOS CON LOS TIPOS DE VALIDACIONES */


const paramsSchema = Joi.object({
  id: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
});


const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categories");

const router = Router();

/* GET ALL CATEGORIES FRONT THE DATABASE */
router.get("/", getAllCategories);

/* CREATE NEW CATEGORY IN THE DATABASE */
router.post("/", createCategory);

/* UPDATE CATEGORY IN THE DATABASE */
router.put("/:id", validator.params(paramsSchema), updateCategory);

/* DELETE CATEGORY IN THE DATABASE */
router.delete("/:id", validator.params(paramsSchema), deleteCategory);

module.exports = router;

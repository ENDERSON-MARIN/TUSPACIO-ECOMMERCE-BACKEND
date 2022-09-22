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


const { getAllProducts, createProduct, updateProduct, disableProduct, getDashboard, getProductType } = require("../controllers/products");

const router = Router();

/* SE ARMAN LAS RUTAS PASANDO LAS VALIDACIONES COMO MIDDLEWARES */

/* GET ALL PRODUCTS FRONT THE DATABASE */
router.get("/", getAllProducts);

router.get("/dashboard", getDashboard);

router.get("/productType", getProductType);

/* CREATE NEW PRODUCT IN THE DATABASE */
router.post("/", createProduct);

/* UPDATE PRODUCT IN THE DATABASE */
router.put("/:id", updateProduct);

/* DISABLED PRODUCT IN THE DATABASE */
// router.delete("/:id", validator.params(paramsSchema), disableProduct);
router.put("/status/:id", validator.params(paramsSchema), disableProduct);


module.exports = router;

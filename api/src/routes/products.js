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
  description: Joi.string().min(3).max(1500).required(),
  price: Joi.number().min(1).precision(1).required(),
  price_sign: Joi.string().min(1).max(3).required(),
  image_link: Joi.string()
    .regex(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i)
    .max(255),
  currency: Joi.string().regex(/^[a-zA-Z\s]+$/),
  rating: Joi.number().precision(1).min(0).max(5),
  categories: Joi.array().items(Joi.string().regex(/^[a-zA-Z\s]+$/)),
  product_type: Joi.string().regex(/^[a-zA-Z\s]+$/),
  brand: Joi.string().regex(/^[a-zA-Z\s]+$/),
  product_colors: Joi.array().items(Joi.string().regex(/^[a-zA-Z\s]+$/)),
  tag_list: Joi.array().items(Joi.string().regex(/^[a-zA-Z\s]+$/)),
  stock: Joi.number().min(0),
  status: Joi.boolean(),
  // stock: Joi.number().min(1).required(),
  // category_id: Joi.string().min(1).max(50).required(),
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
router.put("/:id", validator.params(paramsSchema), validator.body(bodySchema), updateProduct);

/* DISABLED PRODUCT IN THE DATABASE */
router.delete("/:id", validator.params(paramsSchema), disableProduct);


module.exports = router;

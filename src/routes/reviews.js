const { Router } = require("express");
const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({});

/* LINKS TO DOCS JOI AND EXPRESS-JOI-VALIDATION 
https://joi.dev/api/?v=17.6.0
https://github.com/evanshortiss/express-joi-validation#readme
*/

/* SE CREAN LAS REVIEWS CON LOS TIPOS DE VALIDACIONES */
const querySchema = Joi.object({
  name: Joi.string().regex(/^[a-zA-Z\s]+$/),
});

const paramsSchema = Joi.object({
  id: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
});

const bodySchema = Joi.object({
  title: Joi.string(),  
  text: Joi.string(),
  score: Joi.number().min(1).max(5).precision(1).required(),
  product_id: Joi.number().min(1).required(),
  user_id: Joi.number().min(1).required(),
});

const {
    updateRatingOfAProduct,
    getOneReview,
    getAllUserReviews,
    createReview,

    
} = require("../controllers/reviews");
const router = Router();

/* SE ARMAN LAS RUTAS PASANDO LAS VALIDACIONES COMO MIDDLEWARES */

/* GET ALL REVIEWS OF A PRODUCT FROM THE DATABASE */
router.get("/productId/:product_id", updateRatingOfAProduct);

/* GET ONE REVIEW FROM THE DATABASE */
router.get("/reviewId/:id", validator.params(paramsSchema), getOneReview);

/* GET ALL USER REVIEWS */

router.get("/userId/:user_id", getAllUserReviews)

/* CREATE NEW ORDER IN THE DATABASE */
router.post("/", validator.body(bodySchema), createReview);


module.exports = router;
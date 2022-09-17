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
  value: Joi.number().min(1).precision(1).required(),
    status: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
    user_id: Joi.string().regex(/^([a-zA-Z0-9-]+)$/),
    products_id: Joi.array().items(Joi.string().regex(/^([a-zA-Z0-9-]+)$/)),
});

const {
    getAllOrders,
    getLimitOrders,
    getOneOrder,
    getOrdersByStatus,
    getOrdersByUserId,
    createOrder,
    updateOrder,
    deleteOrder
} = require("../controllers/orders");
const router = Router();

/* SE ARMAN LAS RUTAS PASANDO LAS VALIDACIONES COMO MIDDLEWARES */

/* GET ALL PRODUCTS FRONT THE DATABASE */
router.get("/", getAllOrders);

/* GET LIMIT ORDERS FROM THE BOARD DATABASE */
router.get("/dashbord", getLimitOrders);

/* GET ONE ORDER FRONT THE DATABASE */
router.get("/:id", validator.params(paramsSchema), getOneOrder);

/* GET ALL ORDERS BY STATUS FRONT THE DATABASE */
router.get("/status/:status", getOrdersByStatus);

/* GET ALL ORDERS BY USER ID FRONT THE DATABASE */
router.get("/user/:id", getOrdersByUserId);

/* CREATE NEW ORDER IN THE DATABASE */
router.post("/", createOrder);

/* UPDATE ORDER IN THE DATABASE */
router.patch(
  "/:id",
  //validator.params(paramsSchema),
  //validator.body(bodySchema),
  updateOrder
);

/* DELETE ORDER IN THE DATABASE */
router.delete("/:id", validator.params(paramsSchema), deleteOrder);



module.exports = router;

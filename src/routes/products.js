const { Router } = require('express');

const {
  getAllProducts,
  createProduct,
  updateProduct,
  disableProduct,
  getDashboard,
  getProductType,
} = require('../controllers/products');

const router = Router();

/* SE ARMAN LAS RUTAS PASANDO LAS VALIDACIONES COMO MIDDLEWARES */

/* GET ALL PRODUCTS FRONT THE DATABASE */
router.get('/', getAllProducts);

router.get('/dashboard', getDashboard);

router.get('/productType', getProductType);

/* CREATE NEW PRODUCT IN THE DATABASE */
router.post('/', createProduct);

/* UPDATE PRODUCT IN THE DATABASE */
router.put('/:id', updateProduct);

/* DISABLED PRODUCT IN THE DATABASE */
router.delete('/:id', disableProduct);

module.exports = router;

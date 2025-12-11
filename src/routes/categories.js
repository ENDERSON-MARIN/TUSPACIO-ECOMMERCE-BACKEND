const { Router } = require("express");
const Joi = require("joi");
const {
  ValidationMiddleware,
  CommonSchemas,
} = require("../middleware/validation");
const { catchAsync } = require("../middleware/errorHandler");

const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categories");

// Validation schemas
const schemas = {
  params: {
    id: CommonSchemas.id,
  },
  body: {
    create: Joi.object({
      name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .pattern(/^[a-zA-Z\s\u00C0-\u017F]+$/)
        .required()
        .messages({
          "string.min": "Category name must be at least 1 character long",
          "string.max": "Category name must not exceed 100 characters",
          "string.pattern.base":
            "Category name must contain only letters and spaces",
        }),
    }),
    update: Joi.object({
      name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .pattern(/^[a-zA-Z\s\u00C0-\u017F]+$/)
        .optional()
        .messages({
          "string.min": "Category name must be at least 1 character long",
          "string.max": "Category name must not exceed 100 characters",
          "string.pattern.base":
            "Category name must contain only letters and spaces",
        }),
    }),
  },
  query: {
    list: Joi.object({
      brand: Joi.string().trim().max(100).optional(),
      ...CommonSchemas.pagination,
    }),
  },
};

const router = Router();

/* GET ALL CATEGORIES FROM THE DATABASE */
router.get(
  "/",
  ValidationMiddleware.validateQuery(schemas.query.list),
  catchAsync(getAllCategories)
);

/* CREATE NEW CATEGORY IN THE DATABASE */
router.post(
  "/",
  ValidationMiddleware.validateBody(schemas.body.create),
  catchAsync(createCategory)
);

/* UPDATE CATEGORY IN THE DATABASE */
router.put(
  "/:id",
  ValidationMiddleware.validate({
    params: Joi.object(schemas.params),
    body: schemas.body.update,
  }),
  catchAsync(updateCategory)
);

/* DELETE CATEGORY IN THE DATABASE */
router.delete(
  "/:id",
  ValidationMiddleware.validateParams(Joi.object(schemas.params)),
  catchAsync(deleteCategory)
);

module.exports = router;

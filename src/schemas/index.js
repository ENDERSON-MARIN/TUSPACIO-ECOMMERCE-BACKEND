const Joi = require("joi");
const { CommonSchemas } = require("../middleware/validation");

/**
 * Comprehensive validation schemas for the ecommerce application
 */

// User schemas
const UserSchemas = {
  register: Joi.object({
    email: CommonSchemas.email,
    password: CommonSchemas.password,
    nickname: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .required()
      .messages({
        "string.min": "Nickname must be at least 2 characters long",
        "string.max": "Nickname must not exceed 50 characters",
        "string.pattern.base":
          "Nickname can only contain letters, numbers, hyphens, and underscores",
      }),
    firstName: CommonSchemas.name,
    lastName: CommonSchemas.name,
    phone: CommonSchemas.phone.optional(),
  }),

  login: Joi.object({
    email: CommonSchemas.email,
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),

  update: Joi.object({
    email: CommonSchemas.email.optional(),
    nickname: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .optional(),
    firstName: CommonSchemas.name.optional(),
    lastName: CommonSchemas.name.optional(),
    phone: CommonSchemas.phone.optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: CommonSchemas.password,
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Password confirmation does not match new password",
      }),
  }),
};

// Product schemas
const ProductSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(2000).optional(),
    price: Joi.number().positive().precision(2).required(),
    brand: Joi.string().trim().min(1).max(100).required(),
    stock: Joi.number().integer().min(0).required(),
    image: CommonSchemas.url.optional(),
    status: Joi.boolean().default(true),
    categoryIds: Joi.array().items(CommonSchemas.id).min(1).required(),
  }),

  update: Joi.object({
    name: Joi.string().trim().min(1).max(200).optional(),
    description: Joi.string().trim().max(2000).optional(),
    price: Joi.number().positive().precision(2).optional(),
    brand: Joi.string().trim().min(1).max(100).optional(),
    stock: Joi.number().integer().min(0).optional(),
    image: CommonSchemas.url.optional(),
    status: Joi.boolean().optional(),
    categoryIds: Joi.array().items(CommonSchemas.id).min(1).optional(),
  }),

  query: Joi.object({
    name: Joi.string().trim().max(200).optional(),
    brand: Joi.string().trim().max(100).optional(),
    category: CommonSchemas.id.optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    status: Joi.boolean().optional(),
    ...CommonSchemas.pagination,
  }),
};

// Category schemas
const CategorySchemas = {
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

  query: Joi.object({
    brand: Joi.string().trim().max(100).optional(),
    ...CommonSchemas.pagination,
  }),
};

// Order schemas
const OrderSchemas = {
  create: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: CommonSchemas.id,
          quantity: Joi.number().integer().min(1).required(),
          price: Joi.number().positive().precision(2).required(),
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.object({
      street: Joi.string().trim().min(1).max(200).required(),
      city: Joi.string().trim().min(1).max(100).required(),
      state: Joi.string().trim().min(1).max(100).required(),
      zipCode: Joi.string().trim().min(1).max(20).required(),
      country: Joi.string().trim().min(1).max(100).required(),
    }).required(),
    paymentMethodId: Joi.string().required(),
  }),

  update: Joi.object({
    status: Joi.string()
      .valid("pending", "processing", "shipped", "delivered", "cancelled")
      .optional(),
    trackingNumber: Joi.string().trim().max(100).optional(),
  }),

  query: Joi.object({
    status: Joi.string()
      .valid("pending", "processing", "shipped", "delivered", "cancelled")
      .optional(),
    userId: CommonSchemas.id.optional(),
    startDate: CommonSchemas.date.optional(),
    endDate: CommonSchemas.date.optional(),
    ...CommonSchemas.pagination,
  }),
};

// Review schemas
const ReviewSchemas = {
  create: Joi.object({
    productId: CommonSchemas.id,
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().max(1000).optional(),
  }),

  update: Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    comment: Joi.string().trim().max(1000).optional(),
  }),

  query: Joi.object({
    productId: CommonSchemas.id.optional(),
    userId: CommonSchemas.id.optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
    ...CommonSchemas.pagination,
  }),
};

// Payment schemas
const PaymentSchemas = {
  createPaymentIntent: Joi.object({
    amount: Joi.number().positive().precision(2).required(),
    currency: Joi.string().length(3).uppercase().default("USD"),
    orderId: CommonSchemas.id,
    paymentMethodId: Joi.string().optional(),
  }),

  confirmPayment: Joi.object({
    paymentIntentId: Joi.string().required(),
    paymentMethodId: Joi.string().required(),
  }),

  webhook: Joi.object({
    type: Joi.string().required(),
    data: Joi.object().required(),
  }),
};

// Email schemas
const EmailSchemas = {
  send: Joi.object({
    to: Joi.alternatives()
      .try(CommonSchemas.email, Joi.array().items(CommonSchemas.email))
      .required(),
    subject: Joi.string().trim().min(1).max(200).required(),
    template: Joi.string().required(),
    data: Joi.object().optional(),
  }),

  newsletter: Joi.object({
    email: CommonSchemas.email,
    preferences: Joi.object({
      promotions: Joi.boolean().default(true),
      newProducts: Joi.boolean().default(true),
      orderUpdates: Joi.boolean().default(true),
    }).optional(),
  }),
};

// Parameter schemas
const ParamSchemas = {
  id: Joi.object({
    id: CommonSchemas.id,
  }),

  uuid: Joi.object({
    id: CommonSchemas.uuid,
  }),
};

// Header schemas
const HeaderSchemas = {
  auth: Joi.object({
    authorization: Joi.string()
      .pattern(/^Bearer .+/)
      .required()
      .messages({
        "string.pattern.base":
          "Authorization header must be in format 'Bearer <token>'",
      }),
  }).unknown(true),

  contentType: Joi.object({
    "content-type": Joi.string().valid("application/json").required(),
  }).unknown(true),
};

module.exports = {
  UserSchemas,
  ProductSchemas,
  CategorySchemas,
  OrderSchemas,
  ReviewSchemas,
  PaymentSchemas,
  EmailSchemas,
  ParamSchemas,
  HeaderSchemas,
  CommonSchemas,
};

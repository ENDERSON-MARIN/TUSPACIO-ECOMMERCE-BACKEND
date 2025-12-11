const { Categorie, Product } = require("../db");
const logger = require("../utils/logger");
const { NotFoundError, DatabaseError } = require("../middleware/errorHandler");

/* GET ALL CATEGORIES FROM DB */
const getAllCategories = async (req, res, next) => {
  const { brand, page = 1, limit = 10 } = req.query;

  logger.logDatabase("findAll", "Categorie", { brand, page, limit });

  let allCategories = await Categorie.findAll({
    attributes: ["id", "name"],
    include: {
      model: Product,
      attributes: ["id", "name", "brand", "status"],
      // Uncomment to filter active products only
      // where: {
      //   status: true,
      // },
    },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
  });

  if (brand) {
    allCategories = allCategories.filter((category) =>
      category.products.some((product) => product.brand === brand)
    );
  }

  if (!allCategories || allCategories.length === 0) {
    logger.info("No categories found", { brand });
    return res.status(200).json({
      status: "success",
      data: {
        categories: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
        },
      },
    });
  }

  logger.info("Categories retrieved successfully", {
    count: allCategories.length,
    brand,
  });

  res.status(200).json({
    status: "success",
    data: {
      categories: allCategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allCategories.length,
      },
    },
  });
};

/* CREATE NEW CATEGORY IN THE DATABASE */
const createCategory = async (req, res, next) => {
  const { name } = req.body;
  const normalizedName = name.toLowerCase().trim();

  logger.logDatabase("findOne", "Categorie", { name: normalizedName });

  // Check if category already exists
  const existingCategory = await Categorie.findOne({
    where: {
      name: normalizedName,
    },
  });

  if (existingCategory) {
    logger.warn("Attempt to create duplicate category", {
      name: normalizedName,
      existingId: existingCategory.id,
    });

    const error = new Error(`Category '${normalizedName}' already exists`);
    error.name = "ConflictError";
    error.status = 409;
    throw error;
  }

  logger.logDatabase("create", "Categorie", { name: normalizedName });

  const newCategory = await Categorie.create({ name: normalizedName });

  logger.info("Category created successfully", {
    id: newCategory.id,
    name: newCategory.name,
  });

  res.status(201).json({
    status: "success",
    data: {
      category: {
        id: newCategory.id,
        name: newCategory.name,
      },
    },
    message: "Category created successfully",
  });
};

/* UPDATE ONE CATEGORY IN THE DATABASE */
const updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  logger.logDatabase("findByPk", "Categorie", { id });

  // Find category by ID
  const category = await Categorie.findByPk(id);

  if (!category) {
    logger.warn("Attempt to update non-existent category", { id });
    throw new NotFoundError(`Category with ID '${id}' not found`);
  }

  // If name is provided, check for duplicates (excluding current category)
  if (name) {
    const normalizedName = name.toLowerCase().trim();

    const existingCategory = await Categorie.findOne({
      where: {
        name: normalizedName,
      },
    });

    if (existingCategory && existingCategory.id !== id) {
      logger.warn("Attempt to update category with duplicate name", {
        id,
        name: normalizedName,
        conflictingId: existingCategory.id,
      });

      const error = new Error(`Category '${normalizedName}' already exists`);
      error.name = "ConflictError";
      error.status = 409;
      throw error;
    }

    logger.logDatabase("update", "Categorie", { id, name: normalizedName });

    await category.update({ name: normalizedName });

    logger.info("Category updated successfully", {
      id,
      oldName: category.name,
      newName: normalizedName,
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      category: {
        id: category.id,
        name: category.name,
      },
    },
    message: "Category updated successfully",
  });
};

/* DELETE ONE CATEGORY IN THE DATABASE */
const deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  logger.logDatabase("findByPk", "Categorie", { id });

  const category = await Categorie.findByPk(id);

  if (!category) {
    logger.warn("Attempt to delete non-existent category", { id });
    throw new NotFoundError(`Category with ID '${id}' not found`);
  }

  logger.logDatabase("destroy", "Categorie", { id, name: category.name });

  await category.destroy();

  logger.info("Category deleted successfully", {
    id,
    name: category.name,
  });

  res.status(200).json({
    status: "success",
    message: "Category deleted successfully",
  });
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

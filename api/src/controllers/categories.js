const { Categorie, Product } = require("../db");

/* GET ALL CATEGORIES FROM DB */
const getAllCategories = async (req, res, next) => {
  try {
    const { categorie, brand } = req.query;

    let allCategories = await Categorie?.findAll({
      attributes: ["id", "name"],
      include: {
        model: Product,
        /* PARA TRAER PRODUCTOS ACTIVOS POR CATEGORIAS */
        // where: {
        //   status: true,
        // },
      },
    });
    if (brand) {
       allCategories = await allCategories.map((e) => e = { 
        id : e.id,
        name : e.name,
        products: e.products.filter((p) => p.brand === brand)
       })
    }
    if (categorie) {
         allCategories = await allCategories.filter((c) =>
        c.name === categorie)
    }
    res.status(200).send(allCategories);
  } catch (error) {
        return res.status(404).json({
          ok: false,
          msg: "Category not Found!",
        });
      }
    };

/* CREATE NEW CATEGORY IN THE DATABASE */
const createCategory = async (req, res, next) => {
  const { name } = req.body;

  try {
    const query = name.toLowerCase();
    const categoryModel = await Categorie.findOne({
      where: {
        name: query,
      },
    });

    if (categoryModel) {
      return res.status(400).json({
        ok: false,
        msg: `The category ${query} already exists!`,
      });
    }

    const newCategory = await Categorie.create({ name: query });

    res.json({
      ok: true,
      id: newCategory.id,
      name: newCategory.name,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Notify administrator!",
    });
  }
};

/* UPDATE ONE CATEGORY IN THE DATABASE */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    /* FIND CATEGORY IN THE DATABASE BY ID */
    let categoryDB = await Categorie.findOne({
      where: {
        id: id,
      },
    });

    const updatedCategory = await categoryDB.update({
      name,
    });

    res.status(200).send({
      succMsg: "Category Updated Successfully!",
      updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

/* DELETE ONE CATEGORY IN THE DATABASE */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoryDB = await Categorie.findByPk(id);

    if (categoryDB === null) {
      return res.status(400).send("Category not found!");
    } else {
      await categoryDB.destroy();
      return res.status(200).send("Category Deleted Successfully! ");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
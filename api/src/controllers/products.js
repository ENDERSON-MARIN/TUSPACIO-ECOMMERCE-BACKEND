const { Product, Categorie, Ofert } = require("../db");
const axios = require("axios");
const { URL_API } = require("./globalConst");
// const { uploadCategoryDb } = require("../controllers/uploadCategoryDb")
const { QueryTypes } = require('sequelize');
const db = require("../db");

/* GET ALL PRODUCTS FROM DB */
const getAllProducts = async (req, res, next) => {
  try {
    let dbInfo = await Product.findAll({
      where: { status: true},
      include: [{
        model: Categorie,
        attributes: ["name"],
        through: { attributes: [] },
      },
      {
        model: Ofert,
        attributes: ["discountPercent"],
        through: { attributes: [] },
      },
        ]
    });

    dbInfo = dbInfo.map (e=> e = {
      ...e.dataValues,
      discountPrice: e.dataValues.price - (e.dataValues.price * e.dataValues.oferts[0]?.discountPercent / 100) 
    })
    res.status(200).json(dbInfo);
  }
  catch (error) {
    console.log(error);
  }
};

/* CREATE NEW PRODUCT IN THE DATABASE */
const createProduct = async (req, res, next) => {
  try {
    /* ME TRAIGO TODOS LOS VALORES DEL CUERPO DE LA PETICION */
    const {
      brand,
      name,
      price,
      price_sign,
      currency,
      image_link,
      description,
      rating,
      product_type,
      stock,
      tag_list,
      product_colors,
      status,
      categories,
    } = req.body;
    /* CREATE NEW PRODUCT */
    const newProduct = await Product.create({
      brand,
      name,
      price,
      price_sign,
      currency,
      image_link,
      description,
      rating,
      product_type,
      stock,
      tag_list,
      product_colors,
      status,
    });

    const categoriesDb = await Categorie.findAll({
      where: { name: categories },
    });
    newProduct.addCategorie(categoriesDb);

    res.status(200).json({
      succMsg: "Product Created Successfully!",
      newProduct,
    });
  } catch (error) {
    next(error);
  }
};

/* UPDATE ONE PRODUCT IN THE DATABASE */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      brand,
      name,
      price,
      price_sign,
      currency,
      image_link,
      description,
      rating,
      product_type,
      stock,
      tag_list,
      product_colors,
      status,
      categories,
    } = req.body;

    /* BUSCO EL PRODUCT DE LA BD POR EL ID */
    let productDB = await Product.findOne({
      where: {
        id: id,
      },
    });
    /* ACTUALIZO EL PRODUCT CON LOS DATOS QUE RECIBO DEL BODY */
    const updatedProduct = await productDB.update({
      brand,
      name,
      price,
      price_sign,
      currency,
      image_link,
      description,
      rating,
      product_type,
      stock,
      tag_list,
      product_colors,
      status
    });

    if (categories) {
      const categoriesDb = await Categorie.findAll({
        where: { name: categories },
      });
      updatedProduct.addCategorie(categoriesDb);
    }    
    
    res.status(200).send({
      succMsg: "Product Updated Successfully!",
      updatedProduct,
    });
  } catch (error) {
     res.status(400).send({message: error.message})
  }
};

/* DISABLED ONE PRODUCT IN THE DATABASE */
const disableProduct = async (req, res, next) => {
  const { status } = req.body
  // try {
    const { id } = req.params;
   
    if(status === 'on') {
    await Product.update(
      { status: true },
      {
        where: {
          id: id,
        },
      }
    )
    res.status(200).json({
      ok: true,
    });

  } else if( status === 'off') {
    await Product.update(
      { status: false },
      {
        where: {
          id: id,
        },
      }
    )
    res.status(200).json({
      ok: true,
    });
  } else {
    res.status(404).send({message: "valor undefined"});
  }


    



};

const getDashboard = async (req, res) => {

  try {
    const data = await Product.findAll({
      attributes: ["id", "name", "stock", "description", "price"]
    })
    res.send(data)
  } catch (error) {
    res.send({ message: error.message })
  }
}

const getProductType = async (req, res) => {
  try {
    const results = await Product.sequelize.query(
      "select  DISTINCT product_type from products", {
      type: QueryTypes.SELECT}
    )
    res.send(results);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getProductType,
  getAllProducts,
  createProduct,
  updateProduct,
  disableProduct,
  getDashboard,
};

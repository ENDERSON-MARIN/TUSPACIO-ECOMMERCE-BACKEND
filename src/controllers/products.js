const { Product, Categorie } = require("../db");
const axios = require("axios")
const { URL_API } = require("./globalConst")


/* GET ALL PRODUCTS FROM DB */
const getAllProducts = async (req, res, next) => {
  try {
    const api = await axios(URL_INVENTARIO)

    const e = api.data;
    //let allProducts = e.map(e => {

      //e.brand
      // return {
      // async function newProduct(){  
      //   return (
      //   Product.create({
      //   brand: e.brand,
      //   name: e.name,
      //   description: e.description,
      //   price: e.price,
      //   currency: e.currency,
      //   image: e.image_link,
      //   rating: e.rating,
      //   category: e.category,
      //   product_type: e.product_type,
      //   product_colors: e.product_colors.map(e => (
      //     e.hex_value
      //   )),
      //   product_colors_name: e.product_colors.map(e => (
      //     e.colour_name
      //   )),
      //   tag_list: e.tag_list.map(e => e)
      // }))

      // let categoryId = await Categorie.findAll({
      //   where: {
      //     name: e.category
      //   }
      // })
      
      // newProduct.addCategorie(categoryId)
      // } 
    // }
    })

    //res.send(categoryId)
//   } catch (error) {
//     next(error);
//   }
};

/* CREATE NEW PRODUCT IN THE DATABASE */
const createProduct = async (req, res, next) => {
  try {
    /* ME TRAIGO TODOS LOS VALORES DEL CUERPO DE LA PETICION */
    const { name, features, price, image, status, stock, category_id } =
      req.body;
    /* CREATE NEW PRODUCT */
    const newProduct = await Product.create({
      name,
      features,
      price,
      price_sign,
      image,
      status,
      stock,
      category_id,
      product_colors
    });

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
    const { name, features, price, image, status, stock, category_id } =
      req.body;

    /* BUSCO EL PRODUCT DE LA BD POR EL ID */
    let productDB = await Product.findOne({
      where: {
        id: id,
      },
    });
    /* ACTUALIZO EL PRODUCT CON LOS DATOS QUE RECIBO DEL BODY */
    const updatedProduct = await productDB.update({
      name,
      features,
      price,
      image,
      status,
      stock,
      category_id,
    });
    res.status(200).send({
      succMsg: "Product Updated Successfully!",
      updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/* DISABLED ONE PRODUCT IN THE DATABASE */
const disableProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
        },
      }
    );

    const disabledProduct = await Product.findByPk(id, {
      attributes: [
        "id",
        "name",
        "features",
        "price",
        "image",
        "status",
        "stock",
        "category_id",
      ],
      include: {
        model: Categorie,
        attributes: ["name", "id"],
      },
    });

    res.status(200).json({
      ok: true,
      disabledProduct,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  disableProduct
};

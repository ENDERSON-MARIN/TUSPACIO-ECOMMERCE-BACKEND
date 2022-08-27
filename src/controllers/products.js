const { Product, Categorie } = require("../db");
const axios = require("axios")
const { URL_PRODUCTS } = require("./globalConst")

/* GET ALL PRODUCTS FROM DB */
const getAllProducts = async (req, res, next) => {
  try {
    const api = await axios(URL_PRODUCTS )    
    const e = api.data;
    let allProducts = e.map(e => {
        return {
          id: e.id,
          name: e.name,
          features: e.description,
          price: e.price,
          price_sign: e.price_sign,                      // Esto es para agregar el simbolo de dolar, a menos que manejemos un campo mas en la db para indicar la moneda
          image: e.image_link,
          // status,                                    //! descomentar cuando se traiga desde la db
          // stock,                                     //! descomentar cuando se traiga desde la db
          category: e.category,
          // category_id,                                    //!  revisar como es la llamada de la categoria cuando se traiga desde la db
          product_colors: e.product_colors.map(color=>({        //  Esto nos trae los tipos de colores que tiene el producto
            hex_value: color.hex_value,
            colour_name: color.colour_name
          })),
        }
    })   
    res.send(allProducts)
    
    
  } catch (error) {
    next(error);
  }
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
      await Product.update(
        { status: false },
        {
          where: {
            id: id,
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
          attributes: ["category", "id"],
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

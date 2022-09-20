const { Product, Ofert } = require("../db");
const axios = require("axios");
const { URL_API } = require("./globalConst");

/* GET ALL OFERTS FROM DB */

const getDbOferts = async (req, res) => {
  try {
    const dbInfo = await Ofert.findAll({
      include: {
        model: Product,
        attributes: ["name", "id"],
        through: { attributes: [] },
      },
    });
    res.send(dbInfo); 
  } catch (error) {
    console.log(error);
  }
};

/* CREATE NEW OFERT IN THE DATABASE */
const createOfert = async (req, res, next) => {
  try {
    /* ME TRAIGO TODOS LOS VALORES DEL CUERPO DE LA PETICION */
    const {
        startDate,
        endDate,
        status,
        image,
        description,
        discountPercent,
        products_id,
    } = req.body;
    /* CREATE NEW PRODUCT */
    const newOfert = await Ofert.create({
        startDate,
        endDate,
        status,
        image,
        description,
        discountPercent,
        products_id, // ESTO ES UN ARRAY DE ID DE PRODUCTOS
    });

    const products = await Product.findAll({
      where: { id: products_id }, // ESTO ES UN ARRAY DE ID DE PRODUCTOS
    });
    newOfert.addProduct(products);

    res.status(200).json({
      succMsg: "Ofert Created Successfully!",
      newOfert,
    });
  } catch (error) {
    next(error);
  }
};

/* UPDATE ONE OFERT IN THE DATABASE */
const updateOfert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
        startDate,
        endDate,
        status,
        image,
        description,
        discountPercent,
        products_id,
    } = req.body;

    /* BUSCO LA OFERTA EN LA BD POR EL ID */
    let ofertDB = await ofert.findOne({
      where: {
        id: id,
      },
    });
    /* ACTUALIZO LA OFERTA CON LOS DATOS QUE RECIBO DEL BODY */
    const updatedOfert = await ofertDB.update({
        startDate,
        endDate,
        status,
        image,
        description,
        discountPercent,
        products_id,
    });
    res.status(200).send({
      succMsg: "Ofert Updated Successfully!",
      updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/* DISABLE ONE OFERT IN THE DATABASE */
const disableOfert = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Ofert.update(
      { status: false },
      {
        where: {
          id: id,
        },
      }
    );

    const disabledOfert = await Ofert.findByPk(id, {
      attributes: [ 
        "id",
        "startDate",
        "endDate",
        "status",
        "image",
        "description",
        "discountPercent",
        "products_id",       
      ],
    });

    res.status(200).json({
      ok: true,
      disabledOfert,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    getDbOferts,
    createOfert,
    updateOfert,
    disableOfert,
};
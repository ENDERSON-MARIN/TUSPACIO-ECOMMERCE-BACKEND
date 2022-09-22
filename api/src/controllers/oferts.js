const { Product, Ofert } = require("../db");
const axios = require("axios");
const { URL_API } = require("./globalConst");

/* GET ALL OFERTS FROM DB */

const getDbOferts = async (req, res) => {
  try {
    const dbInfo = await Ofert.findAll();
    res.send(dbInfo); 
  } catch (error) {
    console.log(error);
  }
};

/* CREATE NEW OFERT IN THE DATABASE */
const createOfert = async (req, res, next) => {
  try {
    /* ME TRAIGO TODOS LOS VALORES DEL CUERPO DE LA PETICION */
    const {Product_id} = req.params;
    const {
             discountPercent
    } = req.body;
    /* DESTROY OFERT OF THE PRODUCT */
    const ofertsId = await Ofert.findAll({
      where: { Product_id },
    });
    if (ofertsId.length > 0) {
      await Ofert.destroy({
        where: { Product_id },
      });
    }
    /* CREATE NEW OFERT */
    const newOfert = await Ofert.create({
        discountPercent,
        Product_id, 
    });

    res.status(200).json({
      succMsg: "Ofert Created Successfully!",
      newOfert,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    getDbOferts,
    createOfert,
};
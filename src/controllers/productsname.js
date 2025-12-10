// const { Product, Categorie } = require("../db");
const axios = require("axios")
const { URL_API } = require("./globalConst")


/* GET ALL PRODUCTS FROM DB */
const getProductName = async (req, res, next) => {
    try {
        const api = await axios(URL_API)
        const e = api.data;
        let allProductsName = e.map(e => e.name)

        res.send(allProductsName)
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProductName
};

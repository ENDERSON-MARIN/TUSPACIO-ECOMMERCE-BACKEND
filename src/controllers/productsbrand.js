// const { Product, Categorie } = require("../db");
const axios = require("axios")
const { URL_API } = require("./globalConst")


/* GET ALL PRODUCTS FROM DB */
const getProductsBrand = async (req, res, next) => {

    const {brand, categorie} = req.query  

    try {
        const api = await axios(URL_API + "/products")
        let e = api.data; 
        if(categorie){ e = e.filter(c => 
        c.categories.find(e => e.name === categorie)?
        c = {brand: c.brand} : null)}
        const allProducts = e?.map(e => e.brand)
        const clearRepet = new Set(allProducts)
        const allProductsBrand = [...clearRepet]
        res.send(allProductsBrand)
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProductsBrand
};

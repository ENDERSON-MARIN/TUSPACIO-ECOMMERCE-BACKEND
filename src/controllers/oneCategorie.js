const { Product } = require("../db");
const axios = require("axios")
const { URL_API } = require("./globalConst")


/* GET ONE CATEGORY FROM JSON */
const getOneCategorie = async (req, res, next) => {
    const category = req.query.categorie;
        
    const resp = await axios.get(URL_API)
    const dataApi = resp.data

   try {
        let resultCategory = dataApi.filter(e => e.category === category)

        res.send(resultCategory);
    } catch (error) {
        next(error);
    }
}
module.exports = {
    getOneCategorie
};

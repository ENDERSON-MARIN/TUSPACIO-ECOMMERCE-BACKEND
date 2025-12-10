const axios = require("axios")
const { URL_API } = require("./globalConst")


/* GET ONE CATEGORY FROM JSON */
const getSearchProducts = async (req, res, next) => {
    const { categorie, product_type, name } = req.query;

    const resp = await axios.get(URL_API + "/products")
    const dataApi = resp.data
    

    if (name) {
        try {
            resultCategory = dataApi.filter(e=>e.name.toLowerCase().includes(name.toLowerCase()))
            res.send(resultCategory);
        } catch (error) {
            next(error);
        }
    } else if (product_type) {
        try {
            let resultCategory = dataApi.filter(e => e.product_type?.includes(product_type))

            res.send(resultCategory);
        } catch (error) {
            next(error);
        }
    } else if (categorie) {

        try {
            let resultCategory = dataApi.filter(e => e.category == categorie)
            res.send(resultCategory);
        } catch (error) {
            next(error);
        }
    } else{
        res.send("You must enter a valid data")
    }
}
module.exports = {
    getSearchProducts
};
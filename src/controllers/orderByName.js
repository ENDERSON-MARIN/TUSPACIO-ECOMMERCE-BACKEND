const { Product } = require("../db");
const axios = require("axios")
const { URL_API } = require("./globalConst")



const orderName1 = async (data, alpha) => {
    if (alpha === "asc") {
        let result = data.sort((a, b) => {
            if (a.name?. toLowerCase() > b.name ?.toLowerCase()) {
                return 1}
            if (a.name ?.toLowerCase() < b.name ?.toLowerCase()) {
                return -1}
            return 0;
        })
        return result
    }
    if (alpha === "desc") {
        let result = data.sort((a, b) => {
            if (a.name ?.toLowerCase() < b.name ?.toLowerCase()) {
                return 1}
            if (a.name ?.toLowerCase() > b.name ?.toLowerCase()) {
                return -1}
            return 0;
        })
        return result
    }
}
/* ORDERING BY NAME  */
const orderProductsName = async (req, res, next) => {
    const { alpha } = req.query;

    const resp = await axios.get(URL_API)
    const dataApi = resp.data
    try {
        let result = await orderName1(dataApi, alpha)
        res.send (result)
    } catch (error) {
        next(error);
    }
}

module.exports = {
    orderProductsName
};
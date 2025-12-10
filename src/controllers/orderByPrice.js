const { Product } = require("../db");
const axios = require("axios")
const { URL_API } = require("./globalConst")


/* ORDERING BY PRICE  */
const orderProductsPrice = async (req, res, next) => {
    const { orderby } = req.query;

    const resp = await axios.get(URL_API)
    const dataApi = resp.data

    if (orderby === 'max-min') {   
        try {
            dataApi.sort((a, b) => {return b.price - a.price})    
            res.send(dataApi)            
        } catch (error) {
            next(error);
        }              //                    
    } else if (orderby === 'min-max') {        
        try {
            dataApi.sort((a, b) => {return a.price - b.price})         
            res.send(dataApi)
        } catch (error) {
            next(error);
        }
    }
}
module.exports = {
    orderProductsPrice
};
const { Product } = require("../db");
const axios = require("axios")
const { URL_API } = require("./globalConst")


/* GET ONE CATEGORY FROM JSON */
const getRatingProduct = async (req, res, next) => {
    const {ratingBy}  = req.query;

    const resp = await axios.get(URL_API)
    const dataApi = resp.data

    if (ratingBy === 'max-min') {   
        try {
            dataApi.sort((a, b) => {return b.rating - a.rating})    
            res.send(dataApi)            
        } catch (error) {
            next(error);
        }              //                    
    } else if (ratingBy === 'min-max') {        
        try {
            dataApi.sort((a, b) => {return a.rating - b.rating})         
            res.send(dataApi)
        } catch (error) {
            next(error);
        }
    }

    // try {
    //         let resultCategory = dataApi.filter(e => e.rating>= ratingMin && e.rating <= ratingMax);    

    //         res.send(resultCategory);
    //     } catch (error) {
    //             next(error);
    //         }
}
module.exports = {
    getRatingProduct
};
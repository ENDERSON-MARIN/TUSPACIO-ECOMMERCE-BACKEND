const { Product, Categorie, Ofert, Review } = require("../db");
const axios = require("axios")
const { URL_API } = require("./globalConst")


/* GET DETAIL PRODUCT FROM JSON */
const getDetailProduct = async (req, res, next) => {
    const id = req.params.id;

    try {
            const dbInfo = await Product.findOne({
                where: { id },
                include: {
                    model: Categorie,
                    attributes: ["name"],
                    through: { attributes: [] },
                },
            });
            const results = await Review.findAll({
                where: { product_id: id },
            
            });
            const reviews = results.map(e => ({
                title: e.title,
                text: e.text,
                score: e.score,
                
            }))
       
            res.send({dbInfo, reviews});
           } catch (error) {
             console.log(error);
         }
     };
        
module.exports = {getDetailProduct};



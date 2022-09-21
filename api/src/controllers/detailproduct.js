const { Product, Categorie, Ofert, Review } = require("../db");
const axios = require("axios")
const { URL_API } = require("./globalConst")


/* GET DETAIL PRODUCT FROM JSON */
const getDetailProduct = async (req, res, next) =>
{
    const id = req.params.id;

    try {
            let dbInfo = await Product.findOne({
                where: { id },
                 include: [{
                    model: Ofert,
                    attributes: ["discountPercent"],
                    through: { attributes: [] },
                },
                 {
                    model: Categorie,
                    attributes: ["name"],
                    through: { attributes: [] },
                }],    
            });
            const results = await Review.findAll({
                where: { product_id: id },
            
            });
            const reviews = results.map(e => ({
                title: e.title,
                text: e.text,
                score: e.score,
                user_id: e.user_id,   
            }))
        
            dbInfo = {...dbInfo.dataValues, priceOfert: Number(dbInfo.price) - (Number(dbInfo.price) * dbInfo.oferts[0]?.discountPercent / 100)}
         
            res.send({dbInfo, reviews});
           } catch (error) {
             console.log(error);
         }
     };

module.exports = { getDetailProduct };



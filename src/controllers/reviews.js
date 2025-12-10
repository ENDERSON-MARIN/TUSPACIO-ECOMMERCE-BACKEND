const { Product, Review, User } = require("../db");
const axios = require("axios");
const { URL_API } = require("./globalConst");

/* UPDATE RATING OF A PRODUCT */

const updateRatingOfAProduct = async (req, res) => {
  const { product_id} = req.params;
  try {
    const dbInfo = await Review.findAll({
      where: { product_id },
    });
    const result = dbInfo.map(e => ({
      score: e.score,
    }))
    let rating = result.reduce((acc, e) => acc + e.score, 0) / result.length
    rating= rating.toFixed(1)
    const updateRating = await Product.update(
    
        { rating: rating },
    { where: { id: product_id } },
    );
    res.send(updateRating);
    
  } catch (error) {
    console.log(error);
  }
};
/* GET ONE REVIEW FROM DB */
const getOneReview = async (req, res, next) => {
    const { id } = req.params;
    try {
        const dbInfo = await Review.findOne({
            where: { id },
        });
        res.send( dbInfo)
    } catch (error) {
        console.log(error);
    }
};

/* GET ALL REVIEWS FROM A USER */
const getAllUserReviews = async (req, res, next) => {
  const {user_id} = req.params;
  try {
    const dbInfo = await Review.findAll({
      where: {user_id}
    })
    res.send(dbInfo)
  } catch (error) {
    console.log(error);
  }
};

/* CREATE NEW REVIEW IN THE DATABASE */
const createReview = async (req, res, next) => {
  try {
    const {
            title, 
            text,
            score,
            product_id,
            user_id
        } = req.body;
    
    const productDb = await Product.findByPk(product_id);
    const userDb = await User.findByPk(user_id);
    const newReview = await Review.create({
        title,
        text,
        score,
        product_id: productDb.id,
        user_id: userDb.id
    });
 
    res.status(200).json({
      succMsg: "Review Created Successfully!",
      newReview,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    updateRatingOfAProduct,
    getOneReview,
    getAllUserReviews,
    createReview,   
};

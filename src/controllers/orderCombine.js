const { Product, Categorie} = require("../db");
const axios = require("axios")
const { URL_API } = require("./globalConst")

/* GET ALL PRODUCTS FROM DB */
const getAllProducts = async (req, res, next) => {
    try {
      const dbInfo = await Product.findAll({
        include: {
          model: Categorie,
          attributes: ["name"],
          through: { attributes: [] },
        },
      });
      return dbInfo;
    } catch (error) {
      console.log(error);
    }
  };

/* ORDER BY PRICE */
const orderPrice =async (data, price) => {
    if (price === "asc"){     
        const result = data.sort((a, b) => {
            return a.price - b.price
        })
        return result
    }
    if (price === "desc") {
        const result = data.sort((a, b) => {
            return b.price - a.price
        })
        return result
    }
}
/* ORDER BY NAME */
const orderName = async (data, alpha) => {
    if (alpha === "asc") {
        const result = data.sort((a, b) => {
            if (a.name?.toLowerCase() > b.name?.toLowerCase()) {
                return 1}
            if (a.name?.toLowerCase() < b.name?.toLowerCase()) {
                return -1}
            return 0;
        })
        return result
    }
    if (alpha === "desc") {
        const result = data.sort((a, b) => {
            if (a.name?.toLowerCase() < b.name?.toLowerCase()) {
                return 1}
            if (a.name?.toLowerCase() > b.name?.toLowerCase()) {
                return -1}
            return 0;
        })
        return result
    }
}

/* ORDER BY RATING */
const orderRating = async (data, rating) => {
    if (rating === "asc"){     
        const result = data.sort((a, b) => {
            return a.rating - b.rating
        })
        return result
    }
    if (rating === "desc") {
        const result = data.sort((a, b) => {
            return b.rating - a.rating
        })
        return result
    }
}
/COMBINATIONS OF QUERYS/
const orderCombine = async (req, res, next) => {
    const { alpha , category, price, brand, rating } = req.query; 
    let result = await getAllProducts()
    try {
            if(category) {result = await Product.findAll({
                through: { attributes: [] },
                include: {
                    model: Categorie,
                    attributes: ["name"],
                    through: { attributes: [] },
                    where: {name: category}
                    },
                });}
            if (brand) {result = await result.filter((e) => e.brand === brand)}
            if(alpha) {result = await orderName(result, alpha)}
            if(price) {result = await orderPrice(result, price)}
            if(rating) {result = await orderRating(result, rating)}
            res.send(result? result : "No hay resultados")
        } 
        catch (error) {
        console.log(error);
        "No se pudo realizar la busqueda"
    }
}

module.exports = {
    orderCombine
}


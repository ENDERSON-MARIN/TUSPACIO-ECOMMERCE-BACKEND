const { Product } = require("../db");

/* DELETE ONE ORDER IN THE DATABASE */
const updateStockProduct = async (req, res, next) =>
{
    const { stock } = req.query
    const { id } = req.params

    try {
        await Product.update({ stock: stock }, {
            where: {
                id: id
            }
        })
        res.send({
            message: "Successfully updated the stock product"
        })

    } catch (error) {
        res.send({
            message: error.message
        })

    }
};




module.exports = {
    updateStockProduct
};

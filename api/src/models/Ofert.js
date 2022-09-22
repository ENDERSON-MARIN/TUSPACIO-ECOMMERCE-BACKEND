const { DataTypes } = require("sequelize");
const {Product} = require('./Product')

module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define(
    "ofert", {
        discountPercent : {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            notNull: { msg: "The discount percent field cannot be null " },
            notEmpty: true,
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: Product,
            key: "id",
          },
        },
        
      }
    }
  );
};
        

  
    
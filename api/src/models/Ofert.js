const { DataTypes } = require("sequelize");
const {Product} = require('./Product')

module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define(
    "ofert", {
        startDate: {
          type: DataTypes.DATE,
          allowNull: true,
        //   validate: {
        //     notNull: { msg: "The start date field cannot be null " },
        //     notEmpty: true,
        // }
        },
        endDate: {
          type: DataTypes.DATE,
          allowNull: true,
        //   validate: { 
        //     notNull: { msg: "The end date field cannot be null " },
        //     notEmpty: true,
        // }
        },
        status: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        image: {
          type: DataTypes.TEXT,
          allowNull: true,
          validate: {
            isUrl: true,
          },
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        //   validate: {
        //     notNull: { msg: "The description field cannot be null " },
        //     notEmpty: true,
        // }
        },

        discountPercent : {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            notNull: { msg: "The discount percent field cannot be null " },
            notEmpty: true,
        },
        products_id: {
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
        

  
    
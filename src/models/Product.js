const { DataTypes } = require("sequelize");

// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.

module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define(
    "product",
    {
      brand: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "The brand field cannot be null " },
          notEmpty: true,
        },
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "The product name field cannot be null " },
          notEmpty: true,
        },
      },

      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: "The product price field cannot be null " },
          isNumeric: true,
        },
      },

      price_sign: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "The product price_sign field cannot be null " },
          notEmpty: true,
        },
      },

      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "The product currency field cannot be null " },
          notEmpty: true,
        },
      },

      image_link: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: "The product description field cannot be null " },
          notEmpty: true,
        },
      },

      rating: {
        type: DataTypes.DECIMAL(10, 1),
        allowNull: false,
        defaultValue: 0,
        validate: {
          notNull: { msg: "The product rating field cannot be null " },
          isNumeric: true,
          min: 0,
          max: 5,
        },
      },

      product_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "The product type field cannot be null " },
          notEmpty: true,
        },
      },

      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          isEven(value) {
            if (value < 0) {
              throw new Error("Stock cannot be less than zero!");
            }
          },
        },
      },

      tag_list: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },

      product_colors: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        allowNull: true,
      },

      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },          
    },
    {
      timestamps: true,
    }
  );
};

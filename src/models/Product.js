const { DataTypes } = require("sequelize");
const { Categorie } = require("./Categorie");
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.

module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define(
    "product",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "The product name field cannot be null " },
          notEmpty: true,
        },
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: "The product features field cannot be null " },
          notEmpty: true,
        },
      },
      // features: {
      //   type: DataTypes.TEXT,
      //   allowNull: false,
      //   validate: {
      //     notNull: { msg: "The product features field cannot be null " },
      //     notEmpty: true,
      //   },
      // },

      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: "The product price field cannot be null " },
          isNumeric: true,
        },
      },

      currency: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: "The product features field cannot be null " },
          notEmpty: true,
        },
      },

      image: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },

      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          //notNull: { msg: "The product stock field cannot be null " },
          isNumeric: true,
          min: 0,
        },
      },

      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Categorie,
          key: "id",
        },
      },
    },
    {
      timestamps: true,
    }
  );
};

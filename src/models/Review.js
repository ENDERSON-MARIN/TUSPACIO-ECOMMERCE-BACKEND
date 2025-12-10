const { DataTypes } = require('sequelize');
const {Product, User} = require('./Product')
module.exports = (sequelize) => {
  sequelize.define('review', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    score:{
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "The score field cannot be null " },
        isNumeric: true,
        min: 0,
        max: 5,
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
    }
  },
  });
};
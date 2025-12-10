const { DataTypes } = require('sequelize')
module.exports = (sequelize) => {
  sequelize.define(
    "favorite",
    {
      idProduct: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      idUser: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    { timestamps: false }
  );
  
};

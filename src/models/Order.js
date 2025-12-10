const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  sequelize.define('order', {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderProducts:{
      type: DataTypes.JSON,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total:{
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shipping:{
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending','created', 'processing', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
  });
};

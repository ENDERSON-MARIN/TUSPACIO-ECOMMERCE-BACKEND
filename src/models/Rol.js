const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  sequelize.define('rol', {
    rolName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },    
  });
};

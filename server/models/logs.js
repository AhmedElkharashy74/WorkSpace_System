// models/log.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const logs = sequelize.define('Log', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  }, {});
  logs.associate = function(models) {
    // associations can be defined here
    logs.belongsTo(models.User, { foreignKey: 'userId' });
  };
  return logs;
};

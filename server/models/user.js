'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue : 0
    },
  }, {
    timestamps: true,
  });

  User.associate = function(models) {
    User.hasMany(models.Booking, { foreignKey: 'userId' });
  };

  return User;
};

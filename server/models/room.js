
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
   
    name:  {
      type: DataTypes.STRING,
      allowNull: false,
  },
    type: {
      type : DataTypes.STRING,
      allowNull: false,
    },
    cap:  {
      type: DataTypes.INTEGER,
      allowNull: false,
  },
    current:  {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue : 0
  },
    cph: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'room',
  });

  Room.associate = function(models) {
    Room.hasMany(models.Booking, { foreignKey: 'roomId' });
  };

  return Room;
};


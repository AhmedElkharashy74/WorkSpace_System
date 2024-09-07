module.exports = (sequelize, DataTypes) => {
    const Booking = sequelize.define('Booking', {
        
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        roomId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        checkInTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        checkOutTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        duration: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        cost: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'ongoing', // Can be 'ongoing', 'completed', etc.
        }
    });

    Booking.associate = function(models) {
        Booking.belongsTo(models.User, { foreignKey: 'userId' });
        Booking.belongsTo(models.Room, { foreignKey: 'roomId' });
    };

    return Booking;
};

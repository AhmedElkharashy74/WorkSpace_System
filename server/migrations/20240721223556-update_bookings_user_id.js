module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Bookings', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Make userId optional
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Bookings', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false, // Revert to not nullable
    });
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'balance', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue : 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'balance', {
      type: Sequelize.INTEGER,
      allowNull: true, // Revert to not nullable
    });
  }
};

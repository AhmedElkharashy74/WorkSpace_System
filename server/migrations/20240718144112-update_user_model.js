'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Altering the 'email' column
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    // Altering the 'phone' column
    await queryInterface.changeColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverting the 'email' column
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    });

    // Reverting the 'phone' column
    await queryInterface.changeColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    });
  }
};

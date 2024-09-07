'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Bookings', 'checkIn', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Bookings', 'checkIn', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: null, // Revert back if necessary
    });
  }
}

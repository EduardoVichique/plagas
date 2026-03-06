'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'mfa_secret', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('usuarios', 'mfa_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('usuarios', 'rol', {
      type: Sequelize.STRING(50),
      defaultValue: 'user',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'mfa_secret');
    await queryInterface.removeColumn('usuarios', 'mfa_enabled');
    await queryInterface.removeColumn('usuarios', 'rol');
  }
};

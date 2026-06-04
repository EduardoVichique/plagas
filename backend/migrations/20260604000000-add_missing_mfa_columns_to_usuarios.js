'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('usuarios');
    
    if (!tableInfo.mfa_code) {
      await queryInterface.addColumn('usuarios', 'mfa_code', {
        type: Sequelize.STRING(10),
        allowNull: true,
      });
    }
    if (!tableInfo.mfa_expires_at) {
      await queryInterface.addColumn('usuarios', 'mfa_expires_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
    if (!tableInfo.mfa_attempts) {
      await queryInterface.addColumn('usuarios', 'mfa_attempts', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'mfa_code');
    await queryInterface.removeColumn('usuarios', 'mfa_expires_at');
    await queryInterface.removeColumn('usuarios', 'mfa_attempts');
  }
};

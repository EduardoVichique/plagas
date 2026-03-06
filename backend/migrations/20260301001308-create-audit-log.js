'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auditorias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      accion: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      entidad: {
        type: Sequelize.STRING(100),
      },
      entidad_id: {
        type: Sequelize.INTEGER,
      },
      detalles: {
        type: Sequelize.TEXT,
      },
      ip: {
        type: Sequelize.STRING(50),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('auditorias');
  }
};

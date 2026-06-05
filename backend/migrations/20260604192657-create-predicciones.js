'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('predicciones', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      imagen_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      plaga_detectada: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      confianza: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      modelo_usado: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tiempo_ejecucion: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    await queryInterface.addIndex('predicciones', ['usuario_id'], {
      name: 'idx_predicciones_usuario'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('predicciones');
  }
};

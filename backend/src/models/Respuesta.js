/**
 * Modelo Respuesta - Respuestas en temas del foro
 */
module.exports = (sequelize, DataTypes) => {
  const Respuesta = sequelize.define(
    'Respuesta',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      foro_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'foro', key: 'id' },
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },
      contenido: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ayudas_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: 'respuestas',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Respuesta;
};

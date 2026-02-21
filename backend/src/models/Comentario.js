/**
 * Modelo Comentario - Comentarios en reportes
 */
module.exports = (sequelize, DataTypes) => {
  const Comentario = sequelize.define(
    'Comentario',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      reporte_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'reportes', key: 'id' },
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
    },
    {
      tableName: 'comentarios',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Comentario;
};

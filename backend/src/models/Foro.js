/**
 * Modelo Foro - Temas del foro comunitario
 */
module.exports = (sequelize, DataTypes) => {
  const Foro = sequelize.define(
    'Foro',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },
      titulo: {
        type: DataTypes.STRING(300),
        allowNull: false,
      },
      contenido: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      categoria: {
        type: DataTypes.STRING(100),
      },
      ayudas_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: 'foro',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Foro;
};

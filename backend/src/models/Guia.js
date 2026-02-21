/**
 * Modelo Guia - Guías técnicas de plagas
 */
module.exports = (sequelize, DataTypes) => {
  const Guia = sequelize.define(
    'Guia',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      titulo: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      tipo_plaga: {
        type: DataTypes.STRING(100),
      },
      informacion_tecnica: {
        type: DataTypes.TEXT,
      },
      imagen_url: {
        type: DataTypes.STRING(500),
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'guias',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Guia;
};

/**
 * Modelo Reporte - Reportes de plagas con ubicación GPS
 */
module.exports = (sequelize, DataTypes) => {
  const Reporte = sequelize.define(
    'Reporte',
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
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      latitud: {
        type: DataTypes.DECIMAL(10, 8),
      },
      longitud: {
        type: DataTypes.DECIMAL(11, 8),
      },
      imagen_url: {
        type: DataTypes.STRING(500),
      },
      estado: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pendiente',
      },
      tipo_plaga: {
        type: DataTypes.STRING(100),
      },
    },
    {
      tableName: 'reportes',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Reporte;
};

/**
 * Modelo Prediccion - Registros de escaneo de plagas con IA
 */
module.exports = (sequelize, DataTypes) => {
  const Prediccion = sequelize.define(
    'Prediccion',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
      },
      imagen_url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      plaga_detectada: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      confianza: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      modelo_usado: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tiempo_ejecucion: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: 'predicciones',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Prediccion;
};

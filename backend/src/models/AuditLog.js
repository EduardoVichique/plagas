/**
 * Modelo AuditLog - Registro de auditoría del sistema
 */
module.exports = (sequelize, DataTypes) => {
    const AuditLog = sequelize.define(
        'AuditLog',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            usuario_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            accion: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            entidad: {
                type: DataTypes.STRING(100),
            },
            entidad_id: {
                type: DataTypes.INTEGER,
            },
            detalles: {
                type: DataTypes.TEXT,
            },
            ip: {
                type: DataTypes.STRING(50),
            },
        },
        {
            tableName: 'auditorias',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );
    return AuditLog;
};

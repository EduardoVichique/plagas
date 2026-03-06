/**
 * Índice de modelos Sequelize - Carga y asocia todos los modelos
 */
const { Sequelize } = require('sequelize');
const config = require('../config/database.js');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions || {},
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Usuario = require('./Usuario')(sequelize, Sequelize);
db.Reporte = require('./Reporte')(sequelize, Sequelize);
db.Comentario = require('./Comentario')(sequelize, Sequelize);
db.Foro = require('./Foro')(sequelize, Sequelize);
db.Respuesta = require('./Respuesta')(sequelize, Sequelize);
db.Guia = require('./Guia')(sequelize, Sequelize);
db.AuditLog = require('./AuditLog')(sequelize, Sequelize);

// Asociaciones
db.Usuario.hasMany(db.Reporte, { foreignKey: 'usuario_id' });
db.Reporte.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });

db.Reporte.hasMany(db.Comentario, { foreignKey: 'reporte_id' });
db.Comentario.belongsTo(db.Reporte, { foreignKey: 'reporte_id' });
db.Usuario.hasMany(db.Comentario, { foreignKey: 'usuario_id' });
db.Comentario.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });

db.Usuario.hasMany(db.Foro, { foreignKey: 'usuario_id' });
db.Foro.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });

db.Foro.hasMany(db.Respuesta, { foreignKey: 'foro_id' });
db.Respuesta.belongsTo(db.Foro, { foreignKey: 'foro_id' });
db.Usuario.hasMany(db.Respuesta, { foreignKey: 'usuario_id' });
db.Respuesta.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });

module.exports = db;

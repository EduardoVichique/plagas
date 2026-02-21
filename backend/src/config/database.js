/**
 * Configuración de Sequelize para PostgreSQL
 */
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'plaga_user',
    password: process.env.DB_PASSWORD || 'plaga_pass_secure',
    database: process.env.DB_NAME || 'plagacontrol',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  },
  test: {
    username: process.env.DB_USER || 'plaga_user',
    password: process.env.DB_PASSWORD || 'plaga_pass_secure',
    database: process.env.DB_NAME || 'plagacontrol_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true } } : {},
  },
};

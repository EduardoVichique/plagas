const logger = require('../utils/logger');

/**
 * Middleware global de manejo de errores.
 * Asegura que todas las respuestas de error sigan el formato estándar.
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  let statusCode = err.statusCode || 500;
  let message = 'Error interno del servidor';
  let errorDetail = {};

  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Error de validación de datos';
    errorDetail = err.errors?.map((e) => ({ campo: e.path, mensaje: e.message })) || [];
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'El registro ya existe (campo duplicado)';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'El archivo es demasiado grande (límite excedido)';
  } else {
    if (err.statusCode) {
      message = err.message;
    }
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error: errorDetail
  });
};

module.exports = errorHandler;

const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware centralizado de express-validator.
 * Detiene y formatea los errores sin exponer información sensible SQL.
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Auditamos el intento fallido
        logger.warn('Error de validación de entrada', {
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            endpoint: req.originalUrl,
            errors: errors.array().map(e => ({ param: e.param || e.path, msg: e.msg })),
        });

        return res.status(400).json({
            success: false,
            message: 'Error de validación en los datos enviados',
            error: errors.array().map(e => e.msg)
        });
    }
    next();
};

module.exports = { handleValidationErrors };

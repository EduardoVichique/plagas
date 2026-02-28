const logger = require('../utils/logger');

/**
 * Middleware para auditoría avanzada de endpoints.
 * Registra usuario, IP, método, ruta y fecha.
 */
const auditMiddleware = (req, res, next) => {
    // Se ejecuta al finalizar la petición para obtener el código de estado real
    res.on('finish', () => {
        const logData = {
            accion: 'API Request',
            method: req.method,
            endpoint: req.originalUrl || req.url,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            status: res.statusCode,
            bodyPreview: Object.keys(req.body).length ? JSON.stringify(req.body).substring(0, 100) : null, // Cuidado de no exponer passwords
        };

        if (req.user && req.user.id) {
            logData.userId = req.user.id;
            logData.userEmail = req.user.email;
        }

        // Filtrar contraseñas del log
        if (logData.bodyPreview && logData.bodyPreview.toLowerCase().includes('password')) {
            logData.bodyPreview = 'HIDDEN_FOR_SECURITY';
        }

        if (res.statusCode >= 400) {
            logger.warn(`Petición problemática`, logData);
        } else {
            logger.info(`Petición realizada`, logData);
        }
    });

    next();
};

module.exports = auditMiddleware;

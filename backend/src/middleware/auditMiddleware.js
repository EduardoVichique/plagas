const db = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware de registro de auditoría en Base de Datos para transacciones importantes.
 */
const logAudit = (accion, entidadFunc = null) => {
    return async (req, res, next) => {
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                try {
                    let entidadId = null;
                    let entidad = null;
                    
                    if (entidadFunc) {
                        if (typeof entidadFunc === 'function') {
                            entidad = entidadFunc(req, res);
                        } else {
                            entidad = entidadFunc;
                        }
                    }

                    if (req.params.id) entidadId = req.params.id;
                    if (res.locals.entidad_id) entidadId = res.locals.entidad_id;
                    if (req.user && req.user.id) entidadId = entidadId || req.user.id;

                    const userId = req.user ? req.user.id : (req.userId || null);

                    await db.AuditLog.create({
                        usuario_id: userId,
                        accion: accion,
                        entidad: typeof entidad === 'string' ? entidad : (entidad ? entidad.name : null),
                        entidad_id: entidadId,
                        detalles: JSON.stringify({ method: req.method, url: req.originalUrl }),
                        ip: req.ip || req.connection.remoteAddress
                    });
                } catch (error) {
                    logger.error('Error registrando auditoría en DB:', error);
                }
            }
        });
        next();
    };
};

/**
 * Middleware para auditoría avanzada general de peticiones (Winston logger).
 */
const auditMiddleware = (req, res, next) => {
    res.on('finish', () => {
        const logData = {
            accion: 'API Request',
            method: req.method,
            endpoint: req.originalUrl || req.url,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            status: res.statusCode,
            bodyPreview: Object.keys(req.body).length ? JSON.stringify(req.body).substring(0, 100) : null,
        };

        if (req.user && req.user.id) {
            logData.userId = req.user.id;
            logData.userEmail = req.user.email;
        }

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

module.exports = {
    logAudit,
    auditMiddleware
};

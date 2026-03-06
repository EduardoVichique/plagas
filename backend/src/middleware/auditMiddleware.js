/**
 * Middleware de registro de auditoría
 */
const db = require('../models');

const logAudit = (accion, entidadFunc = null) => {
    return async (req, res, next) => {
        // Intercept response finish
        res.on('finish', async () => {
            // Solo loguear respuestas exitosas o específicas, o todas si se desea (aquí logueamos códigos 2xx o 3xx)
            if (res.statusCode >= 200 && res.statusCode < 400) {
                try {
                    let entidadId = null;
                    let entidad = entidadFunc ? entidadFunc(req, res) : null;

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
                    console.error('Error registrando auditoría:', error);
                }
            }
        });
        next();
    };
};

module.exports = { logAudit };

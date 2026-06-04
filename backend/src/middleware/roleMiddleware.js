/**
 * Middleware para Control de Acceso Basado en Roles (RBAC).
 * Asegura que todas las respuestas de error sigan el formato estándar.
 */
const requireRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado',
                error: {}
            });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Permisos insuficientes.',
                error: {}
            });
        }

        next();
    };
};

module.exports = { requireRole };
